import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AlertController, NavController, ActionSheetController, MenuController, ModalController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../menu/menu';
import { AgendasPage } from '../agendas/agendas';
import { NewCouncilDiscussionPage } from '../discussions/new-council-discussion/new-council-discussion';
import { NewAssignmentPage } from '../assignments/new-assignment/new-assignment';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CouncilUsersModalPage } from '../../modals/council-users/council-users';
import { UserCouncilsModalPage } from '../../modals/user-councils/user-councils';

@Component({
    templateUrl: 'agenda-edit.html',
    selector: 'agenda-edit'
})
export class AgendaEditPage {
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
    fellowshipitemsObj = [];
    missionaryitemsObj = [];
    eventObj = [];
    isModalDismissed = true;
    showlist = false;
    showlist1 = false;
    showlist2 = false;

    constructor(public modalCtrl: ModalController, navParams: NavParams, fb: FormBuilder, public appservice: AppService,
        public firebaseservice: FirebaseService, public actionSheetCtrl: ActionSheetController, public alertCtrl: AlertController,
        public nav: NavController, public menuctrl: MenuController) {

        this.councils = [];
        let agenda = navParams.get('agendaselected');
        this.agendaKey = agenda.$key;

        this.spiritualwelfareObj = (agenda.spiritualwelfare != undefined && agenda.spiritualwelfare.length > 0) ? agenda.spiritualwelfare.split('\n') : '';
        this.temporalwelfareObj = (agenda.temporalwelfare != undefined && agenda.temporalwelfare.length > 0) ? agenda.temporalwelfare.split('\n') : '';
        this.fellowshipitemsObj = (agenda.fellowshipitems != undefined && agenda.fellowshipitems.length > 0) ? agenda.fellowshipitems.split('\n') : '';
        this.missionaryitemsObj = (agenda.missionaryitems != undefined && agenda.missionaryitems.length > 0) ? agenda.missionaryitems.split('\n') : '';
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
                    if (usrs[0].firstname + ' ' + usrs[0].lastname === agenda.openingprayer) {
                        (<FormControl>this.agendaeditForm.controls['openingprayer']).setValue(usrs[0].firstname + ' ' + usrs[0].lastname);
                        this.openingprayer = usrs[0];

                    }
                    if (usrs[0].firstname + ' ' + usrs[0].lastname === agenda.spiritualthought) {
                        (<FormControl>this.agendaeditForm.controls['spiritualthought']).setValue(usrs[0].firstname + ' ' + usrs[0].lastname);
                        this.spiritualthought = usrs[0];

                    }

                    if (usrs[0].firstname + ' ' + usrs[0].lastname === agenda.closingprayer) {
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

        let localdate = new Date(agenda.agendadate).toLocaleString();
        let localISOformat = this.localISOformat(localdate);
        this.agendaeditForm = fb.group({
            assignedcouncil: ['', Validators.required],
            assigneddate: [localISOformat, Validators.required],
            openinghymn: [agenda.openinghymn],
            openingprayer: [agenda.openingprayer],
            spiritualthought: [agenda.spiritualthought],
            assignments: [''],
            completedassignments: [''],
            spiritualwelfare: [agenda.spiritualwelfare],
            temporalwelfare: [agenda.temporalwelfare],
            fellowshipitems: [agenda.fellowshipitems],
            missionaryitems: [agenda.missionaryitems],
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

    showCouncilsModal(value) {
        this.users = [];
        this.assignmentslist = [];
        this.completedassignmentslist = [];
        let usercouncilsmodal = this.modalCtrl.create(UserCouncilsModalPage, { usercouncils: this.usercouncils });
        usercouncilsmodal.present();
        usercouncilsmodal.onDidDismiss(council => {
            if (!council) return;
            (<FormControl>this.agendaeditForm.controls['openingprayer']).setValue('');
            (<FormControl>this.agendaeditForm.controls['spiritualthought']).setValue('');
            (<FormControl>this.agendaeditForm.controls['assignments']).setValue('');
            (<FormControl>this.agendaeditForm.controls['completedassignments']).setValue('');
            (<FormControl>this.agendaeditForm.controls['closingprayer']).setValue('');
            this.updateUsers(council.$key);
            (<FormControl>this.agendaeditForm.controls['assignedcouncil']).setValue(council.council);
            this.assignedcouncil = council;
            console.log("this.assignedcouncil", this.assignedcouncil);
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
                    this.firebaseservice.checkNetworkStatus(u[0].$key, function (status) {
                        u[0].status = status ? 'green' : 'gray';
                    });
                    this.users.push(u[0]);
                });
            });
        });
    }

    cancel() {
        this.nav.pop();
    }

    formatAgendaObj(value) {
        let assigneddate = value.assigneddate.replace(/T/, ' ').replace(/Z/, '');
        return {
            assignedcouncil: this.assignedcouncil.council,
            councilid: this.assignedcouncil.$key,
            assigneddate: moment(assigneddate).toISOString(),
            openinghymn: value.openinghymn,
            openingprayer: this.openingprayer.firstname + ' ' + this.openingprayer.lastname,
            spiritualthought: this.spiritualthought.firstname + ' ' + this.spiritualthought.lastname,
            assignments: value.assignments,
            completedassignments: value.completedassignments,
            spiritualwelfare: value.spiritualwelfare,
            temporalwelfare: value.temporalwelfare,
            fellowshipitems: value.fellowshipitems,
            missionaryitems: value.missionaryitems,
            event: value.event,
            closingprayer: this.closingprayer.firstname + ' ' + this.closingprayer.lastname,
            createdby: value.createdby,
            createddate: new Date().toISOString(),
            isactive: value.isactive,
            lastupdateddate: new Date().toISOString()
        }
    }

    edit(value) {
        let formattedAgendaObj = this.formatAgendaObj(value);
        this.firebaseservice.updateAgenda(formattedAgendaObj, this.agendaKey)
            .then(res => { this.showAlert('Agenda has been updated.'); this.nav.push(AgendasPage); })
            .catch(err => { this.showAlert('Unable to updated the Agenda, please try after some time.') })
    }

    delete() {
        this.firebaseservice.removeAgenda(this.agendaKey)
            .then(res => { this.showAlert('Agenda has been deleted.'); this.nav.push(AgendasPage); })
            .catch(err => { this.showAlert('Unable to delete the Agenda, please try after some time.') })
    }

    showAlert(errText) {
        let alert = this.alertCtrl.create({
            title: '',
            subTitle: errText,
            buttons: ['OK']
        });
        alert.present();
    }

    trackByIndex(index: number, obj: any): any {
        return index;
    }

    showList(event) {
        let v = event.target.value;

        this.term = (v.indexOf('@') === 0) ? v.substr(1) : v;
        this.showlist = true;
    }

    showList1(event) {
        let v1 = event.target.value;

        this.term = (v1.indexOf('@') === 0) ? v1.substr(1) : v1;
        this.showlist1 = true;
    }

    showList2(event) {
        let v2 = event.target.value;

        this.term = (v2.indexOf('@') === 0) ? v2.substr(1) : v2;
        this.showlist2 = true;
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
                    cssClass: "actionsheet-cancel",
                    handler: () => {
                    }
                }
            ]
        });

        actionSheet.present();
    }
}
