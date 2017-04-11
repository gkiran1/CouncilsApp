import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AlertController, NavController, ModalController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../menu/menu';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { CouncilUsersModalPage } from '../../modals/council-users/council-users';
import { UserCouncilsModalPage } from '../../modals/user-councils/user-councils';

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
  term: string = '';
  discussionitems;
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
    public nav: NavController) {

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
      createddate: new Date().toDateString(),
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

  agendasArray = [];
  createagenda(agenda) {
    let assigneddate = agenda.assigneddate.replace(/T/, ' ').replace(/Z/, '');
    agenda.assigneddate = moment(assigneddate).toISOString(),
      agenda.discussionitems = (agenda.discussionitems != undefined && agenda.discussionitems.length > 0) ? agenda.discussionitems.replace(/-/gi, '').trim() : '';
    agenda.councilid = this.assignedcouncil.$key;
    this.firebaseservice.createAgendaLite(agenda)
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
    usercouncilsmodal.onDidDismiss(councils => {
      if (!councils) return;
      (<FormControl>this.newagendaliteForm.controls['openingprayer']).setValue('');
      (<FormControl>this.newagendaliteForm.controls['spiritualthought']).setValue('');
      (<FormControl>this.newagendaliteForm.controls['assignments']).setValue('');
      (<FormControl>this.newagendaliteForm.controls['completedassignments']).setValue('');
      (<FormControl>this.newagendaliteForm.controls['closingprayer']).setValue('');
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
    this.nav.pop();
  }
  searchFn(event) {
    this.term = event.target.value;
  }
  keypressed($event) {
    var keycode = ($event.keyCode ? $event.keyCode : $event.which);
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

}
