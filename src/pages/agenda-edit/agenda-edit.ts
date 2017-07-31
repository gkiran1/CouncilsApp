import { Component, ViewChild } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AlertController, NavController, ActionSheetController, MenuController, ModalController, NavParams, ToastController } from 'ionic-angular';
import { AgendasPage } from '../agendas/agendas';
import { NewCouncilDiscussionPage } from '../discussions/new-council-discussion/new-council-discussion';
import { NewAssignmentPage } from '../assignments/new-assignment/new-assignment';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CouncilUsersModalPage } from '../../modals/council-users/council-users';
import { UserCouncilsModalPage } from '../../modals/user-councils/user-councils';
import { AngularFire } from 'angularfire2';
import { Content } from 'ionic-angular';

@Component({
    templateUrl: 'agenda-edit.html',
    selector: 'agenda-edit'
})
export class AgendaEditPage {
    @ViewChild(Content) content: Content;
    minDate = moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');
    users = [];
    councils = [];
    assignmentslist = [];
    completedassignmentslist = [];
    agendaeditForm: FormGroup;
    usercouncils = [];
    term;
    agendaKey = '';
    assignedcouncil;
    openingprayer;
    spiritualthought;
    closingprayer;
    spiritualwelfareObj = [];
    temporalwelfareObj = [];
    missionaryitemsObj = [];
    retentionObj = [];
    activationObj = [];
    historyObj = [];
    gospellearningObj = [];
    eventObj = [];
    spiritualwelfare;
    temporalwelfare;
    missionaryitems;
    retention;
    activation;
    history;
    gospellearning;
    event;
    isModalDismissed = true;
    showlist = false;
    showlist1 = false;
    showlist2 = false;
    user;
    agenda;
    shownGroup = false;
    shownGroup1 = false;
    dateErr = false;

    invalidSpiritualThoughtUsr = false;
    invalidOpeningPrayerUsr = false;
    invalidClosingPrayerUsr = false;

    constructor(public af: AngularFire, public modalCtrl: ModalController, navParams: NavParams, fb: FormBuilder, public appservice: AppService,
        public firebaseservice: FirebaseService, public actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController,
        public nav: NavController, public menuctrl: MenuController, public toast: ToastController) {

        this.af.auth.subscribe(auth => {
            if (!auth) return;
            this.af.database.object('/users/' + auth.uid).subscribe(user => {
                this.user = user;
            });
        });

        this.councils = [];
        let agenda = navParams.get('agendaselected');
        this.agenda = agenda;
        this.agendaKey = agenda.$key;

        this.spiritualwelfareObj = (agenda.spiritualwelfare != undefined && agenda.spiritualwelfare.length > 0) ? agenda.spiritualwelfare.split('\n') : '';
        this.temporalwelfareObj = (agenda.temporalwelfare != undefined && agenda.temporalwelfare.length > 0) ? agenda.temporalwelfare.split('\n') : '';
        this.missionaryitemsObj = (agenda.missionaryitems != undefined && agenda.missionaryitems.length > 0) ? agenda.missionaryitems.split('\n') : '';
        this.retentionObj = (agenda.retention != undefined && agenda.retention.length > 0) ? agenda.retention.split('\n') : '';
        this.activationObj = (agenda.activation != undefined && agenda.activation.length > 0) ? agenda.activation.split('\n') : '';
        this.historyObj = (agenda.history != undefined && agenda.history.length > 0) ? agenda.history.split('\n') : '';
        this.gospellearningObj = (agenda.gospellearning != undefined && agenda.gospellearning.length > 0) ? agenda.gospellearning.split('\n') : '';
        this.eventObj = (agenda.event != undefined && agenda.event.length > 0) ? agenda.event.split('\n') : '';

        this.usercouncils = localStorage.getItem('userCouncils').split(',');
        var councilsIds = localStorage.getItem('userCouncils').split(',');
        councilsIds.forEach(c => {
            this.firebaseservice.getCouncilByCouncilKey(c).subscribe(council => {
                this.councils.push(council);
            });
        });

        firebaseservice.getCouncilByCouncilKey(agenda.councilid).subscribe(council => {
            this.updateUsers(council.$key);
            setTimeout(() => {
                (<FormControl>this.agendaeditForm.controls['assignedcouncil']).setValue(council.council);
                this.assignedcouncil = council;
            });
        });

        this.getUsersByCouncilId(agenda.councilid).subscribe(usersObj => {
            this.users = [];
            usersObj.forEach(usrObj => {
                this.firebaseservice.getUsersByKey(usrObj.userid).subscribe(usrs => {
                    if (usrs[0].$key === agenda.openingprayeruserid) {
                        (<FormControl>this.agendaeditForm.controls['openingprayer']).setValue(usrs[0].firstname + ' ' + usrs[0].lastname);
                        this.openingprayer = usrs[0];

                    }
                    if (usrs[0].$key === agenda.spiritualthoughtuserid) {
                        (<FormControl>this.agendaeditForm.controls['spiritualthought']).setValue(usrs[0].firstname + ' ' + usrs[0].lastname);
                        this.spiritualthought = usrs[0];

                    }

                    if (usrs[0].$key === agenda.closingprayeruserid) {
                        (<FormControl>this.agendaeditForm.controls['closingprayer']).setValue(usrs[0].firstname + ' ' + usrs[0].lastname);
                        this.closingprayer = usrs[0];

                    }

                });
            });
        });

        this.completedassignmentslist = [];
        this.assignmentslist = [];

        this.getAssignmentsByCouncilId(agenda.councilid).subscribe(assignments => {

            assignments.forEach(assignment => {
                if (!assignment.isCompleted) this.assignmentslist.push(assignment);
                if (assignment.isCompleted) this.completedassignmentslist.push(assignment);

                if (assignment.$key === agenda.assignments) {
                    (<FormControl>this.agendaeditForm.controls['assignments']).setValue(assignment);
                }
                if (assignment.$key === agenda.completedassignments) {
                    (<FormControl>this.agendaeditForm.controls['completedassignments']).setValue(assignment);
                }

            });

        });

        let localdate = new Date(agenda.agendadate).toLocaleString("en-US", { timeZone: "UTC" });
        let localISOformat = this.localISOformat(localdate);
        this.agendaeditForm = fb.group({
            assignedcouncil: ['', Validators.required],
            assigneddate: [localISOformat, Validators.required],
            openinghymn: [agenda.openinghymn],
            openingprayer: [agenda.openingprayer],
            spiritualthought: [agenda.spiritualthought],
            assignments: [agenda.assignments],
            completedassignments: [agenda.completedassignments],
            spiritualwelfare: [agenda.spiritualwelfare],
            temporalwelfare: [agenda.temporalwelfare],
            missionaryitems: [agenda.missionaryitems],
            retention: [agenda.retention],
            activation: [agenda.activation],
            history: [agenda.history],
            gospellearning: [agenda.gospellearning],
            event: [agenda.event],
            closingprayer: [agenda.closingprayer],
            createdby: agenda.createdby,
            createddate: agenda.createddate,
            isactive: agenda.isactive,
            lastupdateddate: agenda.lastupdateddate
        });

    }

    getUsersByCouncilId(councilId: string) {
        return this.firebaseservice.getUsersByCouncil(councilId);
    }

    getAssignmentsByCouncilId(councilId: string) {
        return this.firebaseservice.getAssignmentsByCouncil(councilId);
    }
    onChange($event) {
        var newDate = new Date($event.year.value, $event.month.value - 1, $event.day.value, $event.hour.value, $event.minute.value);
        //alert(newDate);
        if (moment(newDate).isBefore(moment().set({ second: 0 }))) {
            this.dateErr = true;
        }
        else {
            this.dateErr = false;
        }
    }

    showCouncilsModal(event, value) {
        event.preventDefault();
        this.users = [];
        this.assignmentslist = [];
        this.completedassignmentslist = [];
        let usercouncilsmodal = this.modalCtrl.create(UserCouncilsModalPage, { usercouncils: this.usercouncils, selectedCouncil: this.assignedcouncil });
        usercouncilsmodal.present();
        usercouncilsmodal.onDidDismiss(council => {
            if (!council) return;
            (<FormControl>this.agendaeditForm.controls['openingprayer']).setValue('');
            (<FormControl>this.agendaeditForm.controls['spiritualthought']).setValue('');
            (<FormControl>this.agendaeditForm.controls['assignments']).setValue('');
            (<FormControl>this.agendaeditForm.controls['completedassignments']).setValue('');
            (<FormControl>this.agendaeditForm.controls['closingprayer']).setValue('');
            this.showlist = false;
            this.showlist1 = false;
            this.showlist2 = false;
            this.updateUsers(council.$key);
            (<FormControl>this.agendaeditForm.controls['assignedcouncil']).setValue(council.council);
            this.assignedcouncil = council;
            this.getAssignmentsByCouncilId(council.$key).subscribe(assignments => {
                assignments.forEach(assignObj => {
                    if (assignObj.isCompleted) {
                        this.completedassignmentslist.push(assignObj);
                    }
                    else {
                        this.assignmentslist.push(assignObj);

                    }
                });

            });
        });
    }

    updateUsers(councilid) {
        this.firebaseservice.getUsersByCouncil(councilid).subscribe(uc => {
            this.users = [];
            uc.forEach(e => {
                this.firebaseservice.getUsersByKey(e.userid).subscribe(u => {
                    if (u[0] && u[0].isactive) {
                        this.firebaseservice.checkNetworkStatus(u[0].$key, function (status) {
                            u[0].status = status ? '#3cb18a' : '#a9aaac';
                        });
                        this.users.push(u[0]);
                    }
                });
            });
        });
    }

    cancel() {
        this.nav.pop({ animate: true, animation: 'transition', direction: 'back' });
    }

    formatAgendaObj(value) {
        let assigneddate = value.assigneddate.replace(/T/, ' ').replace(/Z/, '');
        return {
            assignedcouncil: this.assignedcouncil.council,
            councilid: this.assignedcouncil.$key,
            assigneddate: moment(assigneddate).toISOString(),
            openinghymn: value.openinghymn,
            openingprayer: this.openingprayer ? this.openingprayer.firstname + ' ' + this.openingprayer.lastname : '',
            openingprayeruserid: this.openingprayer ? this.openingprayer.$key : '',
            spiritualthought: this.spiritualthought ? this.spiritualthought.firstname + ' ' + this.spiritualthought.lastname : '',
            spiritualthoughtuserid: this.spiritualthought ? this.spiritualthought.$key : '',
            assignments: (value.assignments === undefined || value.assignments === '') ? '' : value.assignments.$key,
            completedassignments: (value.completedassignments === undefined || value.completedassignments === '') ? '' : value.completedassignments.$key,
            spiritualwelfare: value.spiritualwelfare,
            temporalwelfare: value.temporalwelfare,
            missionaryitems: value.missionaryitems,
            retention: value.retention,
            activation: value.activation,
            history: value.history,
            gospellearning: value.gospellearning,
            event: value.event,
            closingprayer: this.closingprayer ? this.closingprayer.firstname + ' ' + this.closingprayer.lastname : '',
            closingprayeruserid: this.closingprayer ? this.closingprayer.$key : '',
            createdby: value.createdby,
            createddate: new Date().toISOString(),
            isactive: value.isactive,
            lastupdateddate: new Date().toISOString(),
            editedby: this.user.firstname + ' ' + this.user.lastname
        }
    }

    edit(value) {
        let formattedAgendaObj = this.formatAgendaObj(value);
        this.dateErr = false;
        var isFirstError = false;

        if (moment(formattedAgendaObj.assigneddate).isBefore(moment().set({ second: 0 }))) {
            this.dateErr = true;
            if (!isFirstError) {
                isFirstError = true;
                var ele = document.getElementById('dateError');
                ele.scrollIntoView();
            }
        }
        if (value.openingprayer && (!this.openingprayer || (this.openingprayer.firstname + ' ' + this.openingprayer.lastname) !== value.openingprayer)) {
            this.invalidOpeningPrayerUsr = true;
            if (!isFirstError) {
                isFirstError = true;
                var ele = document.getElementById('ionItemOpeningPrayer');
                ele.scrollIntoView();
            }
        }
        if (value.spiritualthought && (!this.spiritualthought || (this.spiritualthought.firstname + ' ' + this.spiritualthought.lastname) !== value.spiritualthought)) {
            this.invalidSpiritualThoughtUsr = true;
            if (!isFirstError) {
                isFirstError = true;
                var ele = document.getElementById('ionItemSpiritualThought');
                ele.scrollIntoView();
            }
        }
        if (value.closingprayer && (!this.closingprayer || (this.closingprayer.firstname + ' ' + this.closingprayer.lastname) !== value.closingprayer)) {
            this.invalidClosingPrayerUsr = true;
            if (!isFirstError) {
                isFirstError = true;
                var ele = document.getElementById('ionItemClosingPrayer');
                ele.scrollIntoView();
            }
        }

        if (!this.invalidOpeningPrayerUsr && !this.invalidSpiritualThoughtUsr && !this.invalidClosingPrayerUsr && !this.dateErr) {
            if (value.spiritualwelfare !== '' && this.spiritualwelfareObj.length === 0) {
                value.spiritualwelfare = value.spiritualwelfare.replace(/- /gi, '').trim();
            }
            else if (this.spiritualwelfareObj.length > 0) {
                value.spiritualwelfare = this.spiritualwelfareObj.join('\n');
            }

            if (value.temporalwelfare !== '' && this.temporalwelfareObj.length === 0) {
                value.temporalwelfare = value.temporalwelfare.replace(/- /gi, '').trim();
            }
            else if (this.temporalwelfareObj.length > 0) {
                value.temporalwelfare = this.temporalwelfareObj.join('\n');
            }

            if (value.missionaryitems !== '' && this.missionaryitemsObj.length === 0) {
                value.missionaryitems = value.missionaryitems.replace(/- /gi, '').trim();
            }
            else if (this.missionaryitemsObj.length > 0) {
                value.missionaryitems = this.missionaryitemsObj.join('\n');
            }

            if (value.retention !== '' && this.retentionObj.length === 0) {
                value.retention = value.retention.replace(/- /gi, '').trim();
            }
            else if (this.retentionObj.length > 0) {
                value.retention = this.retention.join('\n');
            }

            if (value.activation !== '' && this.activationObj.length === 0) {
                value.activation = value.activation.replace(/- /gi, '').trim();
            }
            else if (this.activationObj.length > 0) {
                value.activation = this.activationObj.join('\n');
            }

            if (value.history !== '' && this.historyObj.length === 0) {
                value.history = value.history.replace(/- /gi, '').trim();
            }
            else if (this.historyObj.length > 0) {
                value.history = this.historyObj.join('\n');
            }

            if (value.gospellearning !== '' && this.gospellearningObj.length === 0) {
                value.gospellearning = value.gospellearning.replace(/- /gi, '').trim();
            }
            else if (this.gospellearningObj.length > 0) {
                value.gospellearning = this.gospellearningObj.join('\n');
            }

            if (value.event !== '' && this.eventObj.length === 0) {
                value.event = value.event.replace(/- /gi, '').trim();
            }
            else if (this.eventObj.length > 0) {
                value.event = this.eventObj.join('\n');
            }

            value.spiritualwelfare = (value.spiritualwelfare != undefined && value.spiritualwelfare.length > 0) ? value.spiritualwelfare.replace(/- /gi, '').trim() : '';
            value.temporalwelfare = (value.temporalwelfare != undefined && value.temporalwelfare.length > 0) ? value.temporalwelfare.replace(/- /gi, '').trim() : '';
            value.missionaryitems = (value.missionaryitems != undefined && value.missionaryitems.length > 0) ? value.missionaryitems.replace(/- /gi, '').trim() : '';
            value.retention = (value.retention != undefined && value.retention.length > 0) ? value.retention.replace(/-/gi, '').trim() : '';
            value.activation = (value.activation != undefined && value.activation.length > 0) ? value.activation.replace(/-/gi, '').trim() : '';
            value.history = (value.history != undefined && value.history.length > 0) ? value.history.replace(/-/gi, '').trim() : '';
            value.gospellearning = (value.gospellearning != undefined && value.gospellearning.length > 0) ? value.gospellearning.replace(/-/gi, '').trim() : '';
            value.event = (value.event != undefined && value.event.length > 0) ? value.event.replace(/-/gi, '').trim() : '';

            this.firebaseservice.updateAgenda(formattedAgendaObj, this.agendaKey)
                .then(res => {
                    this.nav.popToRoot();
                    if (formattedAgendaObj.openingprayeruserid) {
                        this.createActivity('opening prayer', formattedAgendaObj.openingprayeruserid);
                    }
                    if (formattedAgendaObj.spiritualthoughtuserid) {
                        this.createActivity('spiritual thought', formattedAgendaObj.spiritualthoughtuserid);
                    }
                    if (formattedAgendaObj.closingprayeruserid) {
                        this.createActivity('closing prayer', formattedAgendaObj.closingprayeruserid, );
                    }
                }).catch(err => { this.showAlert('Connection error.') });
        }
    }

    delete() {
        this.firebaseservice.removeAgenda(this.agendaKey, this.agenda)
            .then(res => {
                this.firebaseservice.removeActivities(this.agendaKey);
                this.nav.pop();
            }).catch(err => { this.showAlert('Connection error.') });
    }

    showConfirm() {
        let actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Confirm delete',
                    cssClass: "actionsheet-items",
                    handler: () => {
                        this.menuctrl.close();
                        this.delete();
                    }
                },
                {
                    text: 'Cancel',
                    cssClass: "actionsheet-cancel",
                    handler: () => {
                    }
                }
            ]
        });
        actionSheet.present();
    }

    showAlert(errText) {
        let toast = this.toast.create({
            message: errText,
            duration: 3000,
            position: 'top'
        });
        toast.present();
    }

    trackByIndex(index: number, obj: any): any {
        return index;
    }

    spiritualkey($event) {
        var keycode = ($event.keyCode ? $event.keyCode : $event.which);
        let v = $event.target.value.split('\n');
        let newValue = v.map(e => {
            if (e.length > 27) {
                e = e.substr(0, 27);
            }
            e = e.charAt(2) ? e.substr(0, 2) + e.charAt(2).toUpperCase() + e.substr(3) : e;
            return e;
        });
        $event.target.value = newValue.join('\n');

        if (keycode == '13') {
            let sw = this.agendaeditForm.value.spiritualwelfare;
            if (sw) {
                (<FormControl>this.agendaeditForm.controls['spiritualwelfare']).setValue(sw + '- ');
            }
        }
    }

    spiritualfocus($event) {
        let sw = this.agendaeditForm.value.spiritualwelfare;
        if (sw == undefined || sw.length == 0) {
            (<FormControl>this.agendaeditForm.controls['spiritualwelfare']).setValue("- ");
        }
    }

    temporalkey($event) {
        var keycode = ($event.keyCode ? $event.keyCode : $event.which);
        let v = $event.target.value.split('\n');
        let newValue = v.map(e => {
            if (e.length > 27) {
                e = e.substr(0, 27);
            }
            e = e.charAt(2) ? e.substr(0, 2) + e.charAt(2).toUpperCase() + e.substr(3) : e;
            return e;
        });
        $event.target.value = newValue.join('\n');
        if (keycode == '13') {
            let tw = this.agendaeditForm.value.temporalwelfare;
            if (tw) {
                (<FormControl>this.agendaeditForm.controls['temporalwelfare']).setValue(tw + '- ');
            }
        }
    }

    temporalfocus($event) {
        let tw = this.agendaeditForm.value.temporalwelfare;
        if (tw == undefined || tw.length == 0) {
            (<FormControl>this.agendaeditForm.controls['temporalwelfare']).setValue("- ");
        }
    }

    missionarykey($event) {
        var keycode = ($event.keyCode ? $event.keyCode : $event.which);
        let v = $event.target.value.split('\n');
        let newValue = v.map(e => {
            if (e.length > 27) {
                e = e.substr(0, 27);
            }
            e = e.charAt(2) ? e.substr(0, 2) + e.charAt(2).toUpperCase() + e.substr(3) : e;
            return e;
        });
        $event.target.value = newValue.join('\n');
        if (keycode == '13') {
            let mi = this.agendaeditForm.value.missionaryitems;
            if (mi) {
                (<FormControl>this.agendaeditForm.controls['missionaryitems']).setValue(mi + '- ');
            }
        }
    }

    missionaryfocus($event) {
        let mi = this.agendaeditForm.value.missionaryitems;
        if (mi == undefined || mi.length == 0) {
            (<FormControl>this.agendaeditForm.controls['missionaryitems']).setValue("- ");
        }
    }

    retentionkey($event) {
        var keycode = ($event.keyCode ? $event.keyCode : $event.which);
        let v = $event.target.value.split('\n');
        let newValue = v.map(e => {
            if (e.length > 27) {
                e = e.substr(0, 27);
            }
            e = e.charAt(2) ? e.substr(0, 2) + e.charAt(2).toUpperCase() + e.substr(3) : e;
            return e;
        });
        $event.target.value = newValue.join('\n');
        if (keycode == '13') {
            let rk = this.agendaeditForm.value.retention;
            if (rk) {
                (<FormControl>this.agendaeditForm.controls['retention']).setValue(rk + '- ');
            }
        }
    }

    retentionfocus($event) {
        let rk = this.agendaeditForm.value.retention;
        if (rk == undefined || rk.length == 0) {
            (<FormControl>this.agendaeditForm.controls['retention']).setValue("- ");
        }
    }

    activationkey($event) {
        var keycode = ($event.keyCode ? $event.keyCode : $event.which);
        let v = $event.target.value.split('\n');
        let newValue = v.map(e => {
            if (e.length > 27) {
                e = e.substr(0, 27);
            }
            e = e.charAt(2) ? e.substr(0, 2) + e.charAt(2).toUpperCase() + e.substr(3) : e;
            return e;
        });
        $event.target.value = newValue.join('\n');
        if (keycode == '13') {
            let ak = this.agendaeditForm.value.activation;
            if (ak) {
                (<FormControl>this.agendaeditForm.controls['activation']).setValue(ak + '- ');
            }
        }
    }

    activationfocus($event) {
        let ak = this.agendaeditForm.value.activation;
        if (ak == undefined || ak.length == 0) {
            (<FormControl>this.agendaeditForm.controls['activation']).setValue("- ");
        }
    }

    historykey($event) {
        var keycode = ($event.keyCode ? $event.keyCode : $event.which);
        let v = $event.target.value.split('\n');
        let newValue = v.map(e => {
            if (e.length > 27) {
                e = e.substr(0, 27);
            }
            e = e.charAt(2) ? e.substr(0, 2) + e.charAt(2).toUpperCase() + e.substr(3) : e;
            return e;
        });
        $event.target.value = newValue.join('\n');
        if (keycode == '13') {
            let hk = this.agendaeditForm.value.history;
            if (hk) {
                (<FormControl>this.agendaeditForm.controls['history']).setValue(hk + '- ');
            }
        }
    }

    historyfocus($event) {
        let hk = this.agendaeditForm.value.history;
        if (hk == undefined || hk.length == 0) {
            (<FormControl>this.agendaeditForm.controls['history']).setValue("- ");
        }
    }

    gospellearningkey($event) {
        var keycode = ($event.keyCode ? $event.keyCode : $event.which);
        let v = $event.target.value.split('\n');
        let newValue = v.map(e => {
            if (e.length > 27) {
                e = e.substr(0, 27);
            }
            e = e.charAt(2) ? e.substr(0, 2) + e.charAt(2).toUpperCase() + e.substr(3) : e;
            return e;
        });
        $event.target.value = newValue.join('\n');
        if (keycode == '13') {
            let gk = this.agendaeditForm.value.gospellearning;
            if (gk) {
                (<FormControl>this.agendaeditForm.controls['gospellearning']).setValue(gk + '- ');
            }
        }
    }

    gospellearningfocus($event) {
        let gk = this.agendaeditForm.value.gospellearning;
        if (gk == undefined || gk.length == 0) {
            (<FormControl>this.agendaeditForm.controls['gospellearning']).setValue("- ");
        }
    }

    eventkey($event) {
        var keycode = ($event.keyCode ? $event.keyCode : $event.which);
        let v = $event.target.value.split('\n');
        let newValue = v.map(e => {
            if (e.length > 27) {
                e = e.substr(0, 27);
            }
            e = e.charAt(2) ? e.substr(0, 2) + e.charAt(2).toUpperCase() + e.substr(3) : e;
            return e;
        });
        $event.target.value = newValue.join('\n');
        if (keycode == '13') {
            let ev = this.agendaeditForm.value.event;
            if (ev) {
                (<FormControl>this.agendaeditForm.controls['event']).setValue(ev + '- ');
            }
        }
    }

    eventfocus($event) {
        let ev = this.agendaeditForm.value.event;
        if (ev == undefined || ev.length == 0) {
            (<FormControl>this.agendaeditForm.controls['event']).setValue("- ");
        }
    }

    showList(event) {
        this.invalidOpeningPrayerUsr = false;
        let v = event.target.value;
        if (v.charAt('0') !== '@') {
            event.target.value = '@' + event.target.value;
            (<FormControl>this.agendaeditForm.controls['openingprayer']).setValue(event.target.value);
        }
        this.term = v.substr(1);
        this.showlist = true;
    }

    showList1(event) {
        this.invalidSpiritualThoughtUsr = false;
        let v1 = event.target.value;
        if (v1.charAt('0') !== '@') {
            event.target.value = '@' + event.target.value;
            (<FormControl>this.agendaeditForm.controls['spiritualthought']).setValue(event.target.value);
        }
        this.term = v1.substr(1);
        this.showlist1 = true;
    }

    showList2(event) {
        this.invalidClosingPrayerUsr = false;
        let v2 = event.target.value;
        if (v2.charAt('0') !== '@') {
            event.target.value = '@' + event.target.value;
            (<FormControl>this.agendaeditForm.controls['closingprayer']).setValue(event.target.value);
        }
        this.term = v2.substr(1);
        this.showlist2 = true;
        setTimeout(() => {
            this.content.scrollToBottom();
        })
    }

    bindAssignto(user) {
        this.showlist = false;
        (<FormControl>this.agendaeditForm.controls['openingprayer']).setValue(user.firstname + ' ' + user.lastname);
        this.openingprayer = user;
    }
    bindAssignto1(user) {
        this.showlist1 = false;
        (<FormControl>this.agendaeditForm.controls['spiritualthought']).setValue(user.firstname + ' ' + user.lastname);
        this.spiritualthought = user;
    }
    bindAssignto2(user) {
        this.showlist2 = false;
        (<FormControl>this.agendaeditForm.controls['closingprayer']).setValue(user.firstname + ' ' + user.lastname);
        this.closingprayer = user;
    }

    pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    localISOformat(date) {
        date = new Date(date);
        return date.getFullYear() +
            '-' + this.pad(date.getMonth() + 1) +
            '-' + this.pad(date.getDate()) +
            'T' + this.pad(date.getHours()) +
            ':' + this.pad(date.getMinutes()) +
            ':' + this.pad(date.getSeconds()) +
            '.' + (date.getMilliseconds() / 1000).toFixed(3).slice(2, 5) +
            'Z';
    };

    plusBtn(item) {
        let actionSheet = this.actionSheetCtrl.create({
            title: item,
            buttons: [
                {
                    text: 'Start Discussion',
                    cssClass: "actionsheet-items",
                    handler: () => {
                        this.menuctrl.close();
                        this.nav.push(NewCouncilDiscussionPage, { item: item });

                    }
                },
                {
                    text: 'Make Assignment',
                    cssClass: "actionsheet-items",
                    handler: () => {
                        this.menuctrl.close();
                        this.nav.push(NewAssignmentPage, { item: item });
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: "actionsheet-cancel",
                    handler: () => {
                    }
                }
            ]
        });

        actionSheet.present();
    }

    createActivity(action, userid) {
        let activity = {
            userid: userid,
            entity: 'Agenda',
            entityid: this.agendaKey,
            action: action,
            councilid: this.assignedcouncil.$key,
            councilname: this.assignedcouncil.council,
            timestamp: new Date().toISOString(),
            createdUserId: this.user.$key,
            createdUserName: this.user.firstname + ' ' + this.user.lastname,
            createdUserAvatar: this.user.avatar
        }
        this.firebaseservice.createActivity(activity);
    }

    toggleGroup() {
        this.shownGroup = !this.shownGroup;
    };

    toggleGroup1() {
        this.shownGroup1 = !this.shownGroup1;
    };
}
