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
            events: ['', Validators.required],            
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
        this.nav.setRoot(WelcomePage);
    }
    searchFn(event) {
        this.term = event.target.value;
    }
}
