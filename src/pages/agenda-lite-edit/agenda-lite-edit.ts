import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AlertController, ActionSheetController, NavController, ModalController, MenuController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../menu/menu';
import { AgendasPage } from '../agendas/agendas';
import { NewCouncilDiscussionPage } from '../discussions/new-council-discussion/new-council-discussion';
import { NewAssignmentPage } from '../assignments/new-assignment/new-assignment';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CouncilUsersModalPage } from '../../modals/council-users/council-users';
import { UserCouncilsModalPage } from '../../modals/user-councils/user-councils';

@Component({
  templateUrl: 'agenda-lite-edit.html',
  selector: 'agenda-lite-edit'
})
export class AgendaLiteEditPage {
  minDate = moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');
  users = [];
  councils = [];
  usercouncils = [];
  assignmentslist = [];
  completedassignmentslist = [];
  agendaliteeditForm: FormGroup;
  agendaKey = '';
  discussionitemsObj = [];
  term;
  assignedcouncil;
  openingprayer;
  spiritualthought;
  closingprayer;
  isModalDismissed = true;
  showlist = false;
  showlist1 = false;
  showlist2 = false;

  constructor(public modalCtrl: ModalController, navParams: NavParams, fb: FormBuilder, public appservice: AppService,
    public firebaseservice: FirebaseService, public alertCtrl: AlertController,
    public nav: NavController, public actionSheetCtrl: ActionSheetController,
    public menuctrl: MenuController
  ) {

    this.councils = [];
    let agenda = navParams.get('agendaselected');
    this.agendaKey = agenda.$key;

    this.discussionitemsObj = (agenda.discussionitems != undefined && agenda.discussionitems.length > 0) ? agenda.discussionitems.split('\n') : '';

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
        (<FormControl>this.agendaliteeditForm.controls['assignedcouncil']).setValue(council.council);
        this.assignedcouncil = council;
      });
    });

    this.getUsersByCouncilId(agenda.councilid).subscribe(usersObj => {
      this.users = [];
      usersObj.forEach(usrObj => {
        this.firebaseservice.getUsersByKey(usrObj.userid).subscribe(usrs => {
          if (usrs[0].firstname + ' ' + usrs[0].lastname === agenda.openingprayer) {
            (<FormControl>this.agendaliteeditForm.controls['openingprayer']).setValue(usrs[0].firstname + ' ' + usrs[0].lastname);
            this.openingprayer = usrs[0];

          }
          if (usrs[0].firstname + ' ' + usrs[0].lastname === agenda.spiritualthought) {
            (<FormControl>this.agendaliteeditForm.controls['spiritualthought']).setValue(usrs[0].firstname + ' ' + usrs[0].lastname);
            this.spiritualthought = usrs[0];

          }

          if (usrs[0].firstname + ' ' + usrs[0].lastname === agenda.closingprayer) {
            (<FormControl>this.agendaliteeditForm.controls['closingprayer']).setValue(usrs[0].firstname + ' ' + usrs[0].lastname);
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
      openinghymn: [agenda.openinghymn],
      openingprayer: [agenda.openingprayer],
      spiritualthought: [agenda.spiritualthought],
      assignments: [''],
      completedassignments: [''],
      discussionitems: [agenda.discussionitems],
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
    usercouncilsmodal.onDidDismiss(councils => {
      if (!councils) return;
      (<FormControl>this.agendaliteeditForm.controls['openingprayer']).setValue('');
      (<FormControl>this.agendaliteeditForm.controls['spiritualthought']).setValue('');
      (<FormControl>this.agendaliteeditForm.controls['assignments']).setValue('');
      (<FormControl>this.agendaliteeditForm.controls['completedassignments']).setValue('');
      (<FormControl>this.agendaliteeditForm.controls['closingprayer']).setValue('');
      this.updateUsers(councils.$key);
      (<FormControl>this.agendaliteeditForm.controls['assignedcouncil']).setValue(councils.council);
      this.assignedcouncil = councils;
      this.getAssignmentsByCouncilId(councils.$key).subscribe(assignments => {
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
      openingprayer: this.openingprayer,
      spiritualthought: this.spiritualthought,
      assignments: value.assignments,
      completedassignments: value.completedassignments,
      discussionitems: value.discussionitems,
      closingprayer: this.closingprayer,
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
    (<FormControl>this.agendaliteeditForm.controls['openingprayer']).setValue(user.firstname + ' ' + user.lastname);

    this.openingprayer = user;
  }
  bindAssignto1(user) {
    this.showlist1 = false;
    (<FormControl>this.agendaliteeditForm.controls['spiritualthought']).setValue(user.firstname + ' ' + user.lastname);

    this.spiritualthought = user;
  }
  bindAssignto2(user) {
    this.showlist2 = false;
    (<FormControl>this.agendaliteeditForm.controls['closingprayer']).setValue(user.firstname + ' ' + user.lastname);

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
}
