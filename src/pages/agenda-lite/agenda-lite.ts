import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AlertController, NavController, ModalController, NavParams, ToastController } from 'ionic-angular';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { UserCouncilsModalPage } from '../../modals/user-councils/user-councils';
import { AngularFire } from 'angularfire2';
import { AgendasPage } from '../agendas/agendas';

@Component({
  templateUrl: 'agenda-lite.html',
  selector: 'agenda-lite'
})
export class AgendaLitePage {
  minDate = moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');
  users = [];
  assignmentslist = [];
  completedassignmentslist = [];
  councils = [];
  newagendaliteForm: FormGroup;
  usercouncils = [];
  term;
  discussionitems;
  assignedcouncil;
  openingprayer;
  spiritualthought;
  closingprayer;
  isModalDismissed = true;
  showlist = false;
  showlist1 = false;
  showlist2 = false;
  user;
  shownGroup = false;
  shownGroup1 = false;
  dateErr = false;

  constructor(public af: AngularFire, public modalCtrl: ModalController, navParams: NavParams, fb: FormBuilder, public appservice: AppService,
    public firebaseservice: FirebaseService, public alertCtrl: AlertController,
    public nav: NavController, public toast: ToastController) {

    this.af.auth.subscribe(auth => {
      if (!auth) return;
      this.af.database.object('/users/' + auth.uid).subscribe(user => {
        this.user = user;
      });
    });

    this.usercouncils = localStorage.getItem('userCouncils').split(',');
    var councilsIds = localStorage.getItem('userCouncils').split(',');
    councilsIds.forEach(councilId => {
      this.firebaseservice.getCouncilByKey(councilId).subscribe(councilObj => {
        this.councils.push(...councilObj);
      })
    })

    let date = this.localISOformat(new Date());
    this.newagendaliteForm = fb.group({
      assignedcouncil: ['', Validators.required],
      assigneddate: [date, Validators.required],
      openinghymn: [''],
      openingprayer: [''],
      spiritualthought: [''],
      assignments: [''],
      completedassignments: [''],
      discussionitems: [''],
      closingprayer: [''],
      createdby: localStorage.getItem('securityToken'),
      createddate: new Date().toISOString(),
      isactive: true,
      lastupdateddate: ''
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

  agendasArray = [];
  createagenda(agenda) {
    this.dateErr = false;
    if (agenda.openingprayer && (!this.openingprayer || (this.openingprayer.firstname + ' ' + this.openingprayer.lastname) !== agenda.openingprayer)) {
      this.showAlert('Invalid user');
      return;
    }
    if (agenda.spiritualthought && (!this.spiritualthought || (this.spiritualthought.firstname + ' ' + this.spiritualthought.lastname) !== agenda.spiritualthought)) {
      this.showAlert('Invalid user');
      return;
    }
    if (agenda.closingprayer && (!this.closingprayer || (this.closingprayer.firstname + ' ' + this.closingprayer.lastname) !== agenda.closingprayer)) {
      this.showAlert('Invalid user');
      return;
    }
    let assigneddate = agenda.assigneddate.replace(/T/, ' ').replace(/Z/, '');
    agenda.assigneddate = moment(assigneddate).toISOString();
    agenda.discussionitems = (agenda.discussionitems != undefined && agenda.discussionitems.length > 0) ? agenda.discussionitems.replace(/[- ]/gi, '').trim() : '';
    agenda.councilid = this.assignedcouncil.$key;
    agenda.openingprayeruserid = (this.openingprayer !== undefined) ? this.openingprayer.$key : '';
    agenda.spiritualthoughtuserid = (this.spiritualthought !== undefined) ? this.spiritualthought.$key : '';
    agenda.closingprayeruserid = (this.closingprayer !== undefined) ? this.closingprayer.$key : '';

    if (moment(assigneddate).isBefore(moment().set({ second: 0 }))) {
      this.dateErr = true;
      // this.showAlert('Invalid date');
    } else {
      this.firebaseservice.createAgendaLite(agenda)
        .then(key => {
          if (agenda.openingprayeruserid) {
            this.createActivity(key, agenda.openingprayeruserid, 'opening prayer');
          }
          if (agenda.spiritualthoughtuserid) {
            this.createActivity(key, agenda.spiritualthoughtuserid, 'spiritual thought');
          }
          if (agenda.closingprayeruserid) {
            this.createActivity(key, agenda.closingprayeruserid, 'closing prayer');
          }
          this.nav.setRoot(AgendasPage);

        })
        .catch(err => { this.showAlert('Internal server error.') })
    }

  }
  showAlert(errText) {
    // let alert = this.alertCtrl.create({
    //   title: '',
    //   subTitle: errText,
    //   buttons: ['OK']
    // });
    // alert.present();

    let toast = this.toast.create({
      message: errText,
      duration: 3000
    })

    toast.present();
  }

  showCouncilsModal(event, value) {
    event.preventDefault();
    this.users = [];
    this.assignmentslist = [];
    this.completedassignmentslist = [];
    let usercouncilsmodal = this.modalCtrl.create(UserCouncilsModalPage, { usercouncils: this.usercouncils, selectedCouncil: this.assignedcouncil });
    usercouncilsmodal.present();
    usercouncilsmodal.onDidDismiss(councils => {
      if (!councils) return;
      (<FormControl>this.newagendaliteForm.controls['openingprayer']).setValue('');
      (<FormControl>this.newagendaliteForm.controls['spiritualthought']).setValue('');
      (<FormControl>this.newagendaliteForm.controls['assignments']).setValue('');
      (<FormControl>this.newagendaliteForm.controls['completedassignments']).setValue('');
      (<FormControl>this.newagendaliteForm.controls['closingprayer']).setValue('');
      this.showlist = false;
      this.showlist1 = false;
      this.showlist2 = false;
      this.updateUsers(councils.$key);
      (<FormControl>this.newagendaliteForm.controls['assignedcouncil']).setValue(councils.council);
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
    this.nav.pop({ animate: true, animation: 'transition', direction: 'back' })
  }
  searchFn(event) {
    this.term = event.target.value;
  }

  keypressed($event) {
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
      let di = this.newagendaliteForm.value.discussionitems;
      if (di) {
        (<FormControl>this.newagendaliteForm.controls['discussionitems']).setValue(di + '- ');
      }
    }

  }

  discussionfocus($event) {
    let di = this.newagendaliteForm.value.discussionitems;
    if (di == undefined || di.length == 0) {
      (<FormControl>this.newagendaliteForm.controls['discussionitems']).setValue("- ");
    }
  }

  showList(event) {
    let v = event.target.value;
    if (v.charAt('0') !== '@') {
      event.target.value = '@' + event.target.value;
      (<FormControl>this.newagendaliteForm.controls['openingprayer']).setValue(event.target.value);
    }
    this.term = v.substr(1);
    this.showlist = true;
  }

  showList1(event) {
    let v1 = event.target.value;
    if (v1.charAt('0') !== '@') {
      event.target.value = '@' + event.target.value;
      (<FormControl>this.newagendaliteForm.controls['spiritualthought']).setValue(event.target.value);
    }
    this.term = v1.substr(1);
    this.showlist1 = true;
  }

  showList2(event) {
    let v2 = event.target.value;
    if (v2.charAt('0') !== '@') {
      event.target.value = '@' + event.target.value;
      (<FormControl>this.newagendaliteForm.controls['closingprayer']).setValue(event.target.value);
    }
    this.term = v2.substr(1);
    this.showlist2 = true;
  }

  bindAssignto(user) {
    this.showlist = false;
    (<FormControl>this.newagendaliteForm.controls['openingprayer']).setValue(user.firstname + ' ' + user.lastname);

    this.openingprayer = user;
  }
  bindAssignto1(user) {
    this.showlist1 = false;
    (<FormControl>this.newagendaliteForm.controls['spiritualthought']).setValue(user.firstname + ' ' + user.lastname);

    this.spiritualthought = user;
  }
  bindAssignto2(user) {
    this.showlist2 = false;
    (<FormControl>this.newagendaliteForm.controls['closingprayer']).setValue(user.firstname + ' ' + user.lastname);

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

  createActivity(agendaKey, userid, action) {
    let activity = {
      userid: userid,
      entity: 'Agenda',
      entityid: agendaKey,
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
