import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AlertController, NavController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../menu/menu';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    templateUrl: 'agenda.html',
    selector: 'agenda'
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
    spiritualwelfare;
    temporalwelfare;
    fellowshipitems;
    missionaryitems;
    event;


    constructor(navParams: NavParams, fb: FormBuilder, public appservice: AppService,
        public firebaseservice: FirebaseService, public alertCtrl: AlertController,
        public nav: NavController) {

        // let council = navParams.get('councilObj');

        var councilsIds = localStorage.getItem('userCouncils').split(',');
        councilsIds.forEach(councilId => {
            this.firebaseservice.getCouncilByKey(councilId).subscribe(councilObj => {
                this.councils.push(...councilObj);
            })
        })

        this.newagendaForm = fb.group({
            assignedcouncil: ['', Validators.required],
            assigneddate: [moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'), Validators.required],
            openinghymn: ['', Validators.required],
            openingprayer: ['', Validators.required],
            spiritualthought: ['', Validators.required],
            assignments: ['', Validators.required],
            completedassignments: ['', Validators.required],
            spiritualwelfare: ['', Validators.required],
            temporalwelfare: ['', Validators.required],
            fellowshipitems: ['', Validators.required],
            missionaryitems: ['', Validators.required],
            event: ['', Validators.required],
            closingprayer: ['', Validators.required],
            createdby: localStorage.getItem('securityToken'),
            createddate: new Date().toDateString(),
            isactive: true,
            // lastupdateddate: ''
        });
    }

    assignedMemberChange(value) {
        this.users = [];
        this.assignmentslist = [];
        this.completedassignmentslist = [];

        this.getUsersByCouncilId(value.assignedcouncil.$key).subscribe(usersObj => {
            usersObj.forEach(usrObj => {
                this.firebaseservice.getUsersByKey(usrObj.userid).subscribe(usrs => {
                    usrs.forEach(usr => {
                        this.users.push(usr);
                    });
                });
            });
        });
        this.getAssignmentsByCouncilId(value.assignedcouncil.$key).subscribe(assignments => {
            assignments.forEach(assignObj => {
                if (assignObj.isCompleted) {
                    this.completedassignmentslist.push(assignObj);
                }
                else {
                    this.assignmentslist.push(assignObj);

                }
            });

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
     agenda.spiritualwelfare = agenda.spiritualwelfare.replace(/-/gi, '').trim();
     agenda.temporalwelfare = agenda.temporalwelfare.replace(/-/gi, '').trim();
     agenda.fellowshipitems = agenda.fellowshipitems.replace(/-/gi, '').trim();
     agenda.missionaryitems = agenda.missionaryitems.replace(/-/gi, '').trim();
     agenda.event = agenda.event.replace(/-/gi, '').trim();

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
        this.spiritualwelfare = "- "
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
        this.temporalwelfare = "- "
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
        this.fellowshipitems = "- "
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
        this.missionaryitems = "- "
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
        this.event = "- "
    }

}
