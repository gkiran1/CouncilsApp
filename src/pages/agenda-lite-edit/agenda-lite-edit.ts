import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AlertController, ActionSheetController, NavController, MenuController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../menu/menu';
import { AgendasPage } from '../agendas/agendas';
import { NewCouncilDiscussionPage } from '../discussions/new-council-discussion/new-council-discussion';
import { NewAssignmentPage } from '../assignments/new-assignment/new-assignment';
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
  discussionitemsObj = [];

  constructor(navParams: NavParams, fb: FormBuilder, public appservice: AppService,
    public firebaseservice: FirebaseService, public alertCtrl: AlertController,
    public nav: NavController, public actionSheetCtrl: ActionSheetController,
    public menuctrl: MenuController
  ) {

    this.councils = [];
    let agenda = navParams.get('agendaselected');
    this.agendaKey = agenda.$key;

    this.discussionitemsObj = agenda.discussionitems.split('\n');

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

    let localdate = new Date(agenda.agendadate).toLocaleString();   
    let localISOformat = this.localISOformat(localdate);
    this.agendaliteeditForm = fb.group({
      assigneddate: [localISOformat, Validators.required],
      assignedcouncil: ['', Validators.required],
      openinghymn: [agenda.openinghymn, Validators.required],
      openingprayer: ['', Validators.required],
      spiritualthought: ['', Validators.required],
      assignments: ['', Validators.required],
      completedassignments: ['', Validators.required],
      discussionitems: [''],
      closingprayer: ['', Validators.required],
      createdby: agenda.createdby,
      createddate: agenda.createddate,
      isactive: agenda.isactive,
      lastupdateddate: agenda.lastupdateddate
    });

  }

  assignedMemberChange(value) {
    this.users = [];
    (<FormControl>this.agendaliteeditForm.controls['openingprayer']).setValue('');
    (<FormControl>this.agendaliteeditForm.controls['spiritualthought']).setValue('');
    (<FormControl>this.agendaliteeditForm.controls['assignments']).setValue('');
    (<FormControl>this.agendaliteeditForm.controls['completedassignments']).setValue('');
    (<FormControl>this.agendaliteeditForm.controls['closingprayer']).setValue('');
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
    this.nav.pop();
  }

  formatAgendaObj(value) {
    let assigneddate = value.assigneddate.replace(/T/, ' ').replace(/Z/, '');
    return {
      assignedcouncil: value.assignedcouncil,
      assigneddate: moment(assigneddate).toISOString(),
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
}
