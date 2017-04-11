import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AlertController, NavController, NavParams, ModalController } from 'ionic-angular';
import { WelcomePage } from '../menu/menu';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CouncilUsersModalPage } from '../../modals/council-users/council-users';
import { UserCouncilsModalPage } from '../../modals/user-councils/user-councils';


@Component({
    templateUrl: 'agenda.html',
    selector: 'agenda-page'
})
export class AgendaPage {
    minDate = moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');
    users = [];
    assignmentslist = [];
    completedassignmentslist = [];
    councils = [];
    newagendaForm: FormGroup;
    usercouncils = [];
    term: string = '';
    assignedcouncil;
    openingprayer;
    spiritualthought;
    closingprayer;
    spiritualwelfare;
    temporalwelfare;
    fellowshipitems;
    missionaryitems;
    event;
    isModalDismissed = true;
    showlist = false;
    showlist1 = false;
    showlist2 = false;

    constructor(public modalCtrl: ModalController, navParams: NavParams, fb: FormBuilder, public appservice: AppService,
        public firebaseservice: FirebaseService, public alertCtrl: AlertController,
        public nav: NavController) {

        // let council = navParams.get('councilObj');

        this.usercouncils = localStorage.getItem('userCouncils').split(',');
        var councilsIds = localStorage.getItem('userCouncils').split(',');
        councilsIds.forEach(councilId => {
            this.firebaseservice.getCouncilByKey(councilId).subscribe(councilObj => {
                this.councils.push(...councilObj);
            })
        })

        let date = this.localISOformat(new Date());
        this.newagendaForm = fb.group({
            assignedcouncil: ['', Validators.required],
            assigneddate: [date, Validators.required],
            openinghymn: [''],
            openingprayer: [''],
            spiritualthought: [''],
            assignments: [''],
            completedassignments: [''],
            spiritualwelfare: [''],
            temporalwelfare: [''],
            fellowshipitems: [''],
            missionaryitems: [''],
            event: [''],
            closingprayer: [''],
            createdby: localStorage.getItem('securityToken'),
            createddate: new Date().toDateString(),
            isactive: true,
            // lastupdateddate: ''
        });
    }

    getUsersByCouncilId(councilId: string) {
        return this.firebaseservice.getUsersByCouncil(councilId);
    }

    getAssignmentsByCouncilId(councilId: string) {
        return this.firebaseservice.getAssignmentsByCouncil(councilId);
    }

    agendasArray = [];
    createagenda(agenda) {
        let assigneddate = agenda.assigneddate.replace(/T/, ' ').replace(/Z/, '');
        agenda.assigneddate = moment(assigneddate).toISOString(),
            agenda.spiritualwelfare = (agenda.spiritualwelfare != undefined && agenda.spiritualwelfare.length > 0) ? agenda.spiritualwelfare.replace(/-/gi, '').trim() : '';
        agenda.temporalwelfare = (agenda.temporalwelfare != undefined && agenda.temporalwelfare.length > 0) ? agenda.temporalwelfare.replace(/-/gi, '').trim() : '';
        agenda.fellowshipitems = (agenda.fellowshipitems != undefined && agenda.fellowshipitems.length > 0) ? agenda.fellowshipitems.replace(/-/gi, '').trim() : '';
        agenda.missionaryitems = (agenda.missionaryitems != undefined && agenda.missionaryitems.length > 0) ? agenda.missionaryitems.replace(/-/gi, '').trim() : '';
        agenda.event = (agenda.event != undefined && agenda.event.length > 0) ? agenda.event.replace(/-/gi, '').trim() : '';
        agenda.councilid = this.assignedcouncil.$key;

        this.firebaseservice.createAgenda(agenda)
            .then(res => {
                this.showAlert('Agenda created successfully.');
                this.nav.push(WelcomePage)
            })
            .catch(err => this.showAlert(err))
    }


    showAlert(errText) {
        let alert = this.alertCtrl.create({
            title: '',
            subTitle: errText,
            buttons: ['OK']
        });
        alert.present();
    }

    showCouncilsModal(event, value) {
        event.preventDefault();
        this.users = [];
        this.assignmentslist = [];
        this.completedassignmentslist = [];
        let usercouncilsmodal = this.modalCtrl.create(UserCouncilsModalPage, { usercouncils: this.usercouncils });
        usercouncilsmodal.present();
        usercouncilsmodal.onDidDismiss(council => {
            if (!council) return;
            (<FormControl>this.newagendaForm.controls['openingprayer']).setValue('');
            (<FormControl>this.newagendaForm.controls['spiritualthought']).setValue('');
            (<FormControl>this.newagendaForm.controls['assignments']).setValue('');
            (<FormControl>this.newagendaForm.controls['completedassignments']).setValue('');
            (<FormControl>this.newagendaForm.controls['closingprayer']).setValue('');
            this.updateUsers(council.$key);
            (<FormControl>this.newagendaForm.controls['assignedcouncil']).setValue(council.council);
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
    searchFn(event) {
        this.term = event.target.value;
    }
    spiritualkey($event) {
        var keycode = ($event.keyCode ? $event.keyCode : $event.which);
        if (keycode == '13') {
            if (this.spiritualwelfare) {
                this.spiritualwelfare = this.spiritualwelfare + "- ";
            }
        }
    }

    spiritualfocus($event) {
        if (this.spiritualwelfare == undefined || this.spiritualwelfare.length == 0) {
            this.spiritualwelfare = "- "
        }
    }

    temporalkey($event) {
        var keycode = ($event.keyCode ? $event.keyCode : $event.which);
        if (keycode == '13') {
            if (this.temporalwelfare) {
                this.temporalwelfare = this.temporalwelfare + "- ";
            }
        }
    }

    temporalfocus($event) {
        if (this.temporalwelfare == undefined || this.temporalwelfare.length == 0) {
            this.temporalwelfare = "- "
        }
    }
    fellowshipkey($event) {
        var keycode = ($event.keyCode ? $event.keyCode : $event.which);
        if (keycode == '13') {
            if (this.fellowshipitems) {
                this.fellowshipitems = this.fellowshipitems + "- ";
            }
        }
    }

    fellowshipfocus($event) {
        if (this.fellowshipitems == undefined || this.fellowshipitems.length == 0) {
            this.fellowshipitems = "- "
        }
    }

    missionarykey($event) {
        var keycode = ($event.keyCode ? $event.keyCode : $event.which);
        if (keycode == '13') {
            if (this.missionaryitems) {
                this.missionaryitems = this.missionaryitems + "- ";
            }
        }
    }

    missionaryfocus($event) {
        if (this.missionaryitems == undefined || this.missionaryitems.length == 0) {
            this.missionaryitems = "- "
        }
    }

    eventkey($event) {
        var keycode = ($event.keyCode ? $event.keyCode : $event.which);
        if (keycode == '13') {
            if (this.event) {
                this.event = this.event + "- ";
            }
        }
    }

    eventfocus($event) {
        if (this.event == undefined || this.event.length == 0) {
            this.event = "- "
        }
    }

    pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    showList(event) {
        let v = event.target.value;
        if (v.charAt('0') !== '@') {
            event.target.value = '';
            this.showlist = false; return;
        }
        this.term = v.substr(1);
        this.showlist = true;
    }

    showList1(event) {
        let v1 = event.target.value;
        if (v1.charAt('0') !== '@') {
            event.target.value = '';
            this.showlist = false; return;
        }
        this.term = v1.substr(1);
        this.showlist = true;
    }

    showList2(event) {
        let v2 = event.target.value;
        if (v2.charAt('0') !== '@') {
            event.target.value = '';
            this.showlist = false; return;
        }
        this.term = v2.substr(1);
        this.showlist = true;
    }


    bindAssignto(user) {
        this.showlist = false;
        (<FormControl>this.newagendaForm.controls['openingprayer']).setValue(user.firstname + ' ' + user.lastname);

        this.openingprayer = user;
    }
    bindAssignto1(user) {
        this.showlist1 = false;
        (<FormControl>this.newagendaForm.controls['spiritualthought']).setValue(user.firstname + ' ' + user.lastname);

        this.spiritualthought = user;
    }
    bindAssignto2(user) {
        this.showlist2 = false;
        (<FormControl>this.newagendaForm.controls['closingprayer']).setValue(user.firstname + ' ' + user.lastname);

        this.closingprayer = user;
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


}
