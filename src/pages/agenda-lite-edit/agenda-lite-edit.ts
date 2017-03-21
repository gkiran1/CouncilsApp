import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AlertController, NavController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../menu/menu';
import { AgendasPage } from '../agendas/agendas';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  templateUrl: 'agenda-lite-edit.html',
  selector: 'agenda-lite-edit'
})
export class AgendaLiteEditPage {
   minDate = moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');
  users = [];
  councils = [];
  assignmentslist = [];
  completedassignmentslist = [];
  agendaliteeditForm: FormGroup;
  agendaKey = '';

  constructor(navParams: NavParams, fb: FormBuilder, public appservice: AppService,
    public firebaseservice: FirebaseService, public alertCtrl: AlertController,
    public nav: NavController) {

    this.councils = [];
    let agenda = navParams.get('agendaselected');
    this.agendaKey = agenda.$key;

    var councilsIds = localStorage.getItem('userCouncils').split(',');
    councilsIds.forEach(councilId => {
      this.firebaseservice.getCouncilByKey(councilId).subscribe(councilObj => {
        if (councilObj[0]) {
          if (councilObj[0].$key === agenda.councilid) {
            (<FormControl>this.agendaliteeditForm.controls['assignedcouncil']).setValue(councilObj[0]);
          }
          this.councils.push(...councilObj);
        }
      });
    });

    this.getUsersByCouncilId(agenda.councilid).subscribe(usersObj => {
      this.users = [];
      usersObj.forEach(usrObj => {
        this.firebaseservice.getUsersByKey(usrObj.userid).subscribe(usrs => {

          if (usrs[0].$key === agenda.openingprayer) {
            (<FormControl>this.agendaliteeditForm.controls['openingprayer']).setValue(usrs[0]);
          }
          if (usrs[0].$key === agenda.spiritualthought) {
            (<FormControl>this.agendaliteeditForm.controls['spiritualthought']).setValue(usrs[0]);
          }

          if (usrs[0].$key === agenda.closingprayer) {
            (<FormControl>this.agendaliteeditForm.controls['closingprayer']).setValue(usrs[0]);
          }
          this.users.push(usrs[0]);
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
          (<FormControl>this.agendaliteeditForm.controls['assignments']).setValue(assignment);
        }
        if (assignment.$key === agenda.completedassignments) {
          (<FormControl>this.agendaliteeditForm.controls['completedassignments']).setValue(assignment);
        }

      });

    });

    this.agendaliteeditForm = fb.group({
      assignedcouncil: ['', Validators.required],
      assigneddate: [moment(agenda.assigneddate, 'DDDD, MMM D, YYYY, hh:mma').format(), Validators.required],
      openinghymn: [agenda.openinghymn, Validators.required],
      openingprayer: ['', Validators.required],
      spiritualthought: ['', Validators.required],
      assignments: ['', Validators.required],
      completedassignments: ['', Validators.required],
      discussionitems: [agenda.discussionitems, Validators.required],
      closingprayer: ['', Validators.required],
      createdby: agenda.createdby,
      createddate: agenda.createddate,
      isactive: agenda.isactive,
      lastupdateddate: agenda.lastupdateddate
    });

  }

  assignedMemberChange(value) {
    this.users = [];
    this.getUsersByCouncilId(value.assignedcouncil.$key).subscribe(usersObj => {
      usersObj.forEach(usrObj => {
        this.firebaseservice.getUsersByKey(usrObj.userid).subscribe(usrs => {
          usrs.forEach(usr => {
            this.users.push(usr);
          });
        });
      });
    });

    //  this.allassignments = [];
    this.completedassignmentslist = [];
    this.assignmentslist = [];

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

  cancel() {
    this.nav.setRoot(WelcomePage);
  }

  formatAgendaObj(value) {
    return {
      assignedcouncil: value.assignedcouncil,
      assigneddate: moment(value.assigneddate, "YYYY-MM-DD").toISOString(),
      openinghymn: value.openinghymn,
      openingprayer: value.openingprayer,
      spiritualthought: value.spiritualthought,
      assignments: value.assignments,
      completedassignments: value.completedassignments,
      discussionitems: value.discussionitems,
      closingprayer: value.closingprayer,
      createdby: value.createdby,
      createddate: new Date().toISOString(),
      isactive: value.isactive,
      lastupdateddate: new Date().toISOString()
    }
  }

  edit(value) {
    let formattedAgendaObj = this.formatAgendaObj(value);
    this.firebaseservice.updateAgendaLite(formattedAgendaObj, this.agendaKey)
      .then(res => { this.showAlert('Agenda Lite has been updated.'); this.nav.push(AgendasPage); })
      .catch(err => { this.showAlert('Unable to updated the Agenda Lite, please try after some time.') })
  }

  delete() {
    this.firebaseservice.removeAgendaLite(this.agendaKey)
      .then(res => { this.showAlert('Agenda Lite has been deleted.'); this.nav.push(AgendasPage); })
      .catch(err => { this.showAlert('Unable to delete the Agenda Lite, please try after some time.') })
  }

  showAlert(errText) {
    let alert = this.alertCtrl.create({
      title: '',
      subTitle: errText,
      buttons: ['OK']
    });
    alert.present();
  }
}
