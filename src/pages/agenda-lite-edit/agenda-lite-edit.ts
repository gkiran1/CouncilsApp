import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AlertController, ActionSheetController, NavController, ModalController, MenuController, NavParams } from 'ionic-angular';
import { AgendasPage } from '../agendas/agendas';
import { NewCouncilDiscussionPage } from '../discussions/new-council-discussion/new-council-discussion';
import { NewAssignmentPage } from '../assignments/new-assignment/new-assignment';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CouncilUsersModalPage } from '../../modals/council-users/council-users';
import { UserCouncilsModalPage } from '../../modals/user-councils/user-councils';
import { AngularFire } from 'angularfire2';

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
  discussionitems;
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
  user;
  agenda;
  shownGroup = false;
  shownGroup1 = false;

  constructor(public af: AngularFire, public modalCtrl: ModalController, navParams: NavParams, fb: FormBuilder, public appservice: AppService,
    public firebaseservice: FirebaseService, public alertCtrl: AlertController,
    public nav: NavController, public actionSheetCtrl: ActionSheetController,
    public menuctrl: MenuController
  ) {

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
          if (usrs[0].$key === agenda.openingprayeruserid) {
            (<FormControl>this.agendaliteeditForm.controls['openingprayer']).setValue(usrs[0].firstname + ' ' + usrs[0].lastname);
            this.openingprayer = usrs[0];

          }
          if (usrs[0].$key === agenda.spiritualthoughtuserid) {
            (<FormControl>this.agendaliteeditForm.controls['spiritualthought']).setValue(usrs[0].firstname + ' ' + usrs[0].lastname);
            this.spiritualthought = usrs[0];

          }

          if (usrs[0].$key === agenda.closingprayeruserid) {
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
      assignments: [agenda.assignments],
      completedassignments: [agenda.completedassignments],
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

  showCouncilsModal(event, value) {
    event.preventDefault();
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
      this.showlist = false;
      this.showlist1 = false;
      this.showlist2 = false;
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
      discussionitems: value.discussionitems,
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
    if (value.openingprayer && (!this.openingprayer || (this.openingprayer.firstname + ' ' + this.openingprayer.lastname) !== value.openingprayer)) {
      this.showAlert('Please assign to a valid user');
      return;
    }
    if (value.spiritualthought && (!this.spiritualthought || (this.spiritualthought.firstname + ' ' + this.spiritualthought.lastname) !== value.spiritualthought)) {
      this.showAlert('Please assign to a valid user');
      return;
    }
    if (value.closingprayer && (!this.closingprayer || (this.closingprayer.firstname + ' ' + this.closingprayer.lastname) !== value.closingprayer)) {
      this.showAlert('Please assign to a valid user');
      return;
    }
    value.discussionitems = (value.discussionitems != undefined && value.discussionitems.length > 0) ? value.discussionitems.replace(/-/gi, '').trim() : '';
    let formattedAgendaObj = this.formatAgendaObj(value);
    this.firebaseservice.updateAgendaLite(formattedAgendaObj, this.agendaKey)
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
      })
      .catch(err => { this.showAlert('Unable to updated the Agenda Lite, please try after some time.') })
  }

  delete() {
    this.firebaseservice.removeAgendaLite(this.agendaKey)
      .then(res => {
        // if (this.agenda.openingprayeruserid) {
        //   this.createActivity('opening prayer', this.agenda.openingprayeruserid);
        // }
        // if (this.agenda.spiritualthoughtuserid) {
        //   this.createActivity('spiritual thought', this.agenda.spiritualthoughtuserid);
        // }
        // if (this.agenda.closingprayeruserid) {
        //   this.createActivity('closing prayer', this.agenda.closingprayeruserid, );
        // }

        this.nav.pop();
      })
      .catch(err => { this.showAlert('Unable to delete the Agenda Lite, please try after some time.') })
  }

  showConfirm() {
    let confirm = this.alertCtrl.create({
      title: 'Are you sure you want to delete?',
      // message: 'Do you agree to use this lightsaber to do good across the intergalactic galaxy?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.delete();
          }
        },
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        }
      ]
    });
    confirm.present();
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

  keypressed($event) {
    var keycode = ($event.keyCode ? $event.keyCode : $event.which);
    let v = $event.target.value.split('\n');
    let newValue = v.map(e => {
      if (e.length > 27) {
        e = e.substr(0, 27);
      }
      return e;
    });
    $event.target.value = newValue.join('\n');

    if (keycode == '13') {
      if (this.discussionitems) {
        this.discussionitems = this.discussionitems + "- ";
      }
    }

  }

  discussionfocus($event) {
    if (this.discussionitems == undefined || this.discussionitems.length == 0) {
      this.discussionitems = "- "
    }

  }
  trackByIndex(index: number, obj: any): any {
    return index;
  }

  showList(event) {
    let v = event.target.value;
    if (v.charAt('0') !== '@') {
      event.target.value = '@' + event.target.value;
      (<FormControl>this.agendaliteeditForm.controls['openingprayer']).setValue(event.target.value);
    }
    this.term = v.substr(1);
    this.showlist = true;
  }

  showList1(event) {
    let v1 = event.target.value;
    if (v1.charAt('0') !== '@') {
      event.target.value = '@' + event.target.value;
      (<FormControl>this.agendaliteeditForm.controls['spiritualthought']).setValue(event.target.value);
    }
    this.term = v1.substr(1);
    this.showlist1 = true;
  }

  showList2(event) {
    let v2 = event.target.value;
    if (v2.charAt('0') !== '@') {
      event.target.value = '@' + event.target.value;
      (<FormControl>this.agendaliteeditForm.controls['closingprayer']).setValue(event.target.value);
    }
    this.term = v2.substr(1);
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
