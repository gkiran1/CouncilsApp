import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AlertController, NavController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../menu/menu';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

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
//discussionitems=[];

  constructor(navParams: NavParams, fb: FormBuilder, public appservice: AppService,
    public firebaseservice: FirebaseService, public alertCtrl: AlertController,
    public nav: NavController) {

    // let council = navParams.get('councilObj');
// this.discussionitems.push({});

    var councilsIds = localStorage.getItem('userCouncils').split(',');
    councilsIds.forEach(councilId => {
      this.firebaseservice.getCouncilByKey(councilId).subscribe(councilObj => {
        this.councils.push(...councilObj);
      })
    })

    this.newagendaliteForm = fb.group({
      assignedcouncil: ['', Validators.required],
      assigneddate: [moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'), Validators.required],
      openinghymn: ['', Validators.required],
      openingprayer: ['', Validators.required],
      spiritualthought: ['', Validators.required],
      assignments: ['', Validators.required],
      completedassignments: ['', Validators.required],
      discussionitems: ['', Validators.required],
      closingprayer: ['', Validators.required],
      createdby: localStorage.getItem('securityToken'),
      createddate: new Date().toDateString(),
      isactive: true,
      lastupdateddate: ''
    });
  }

  assignedMemberChange(value) {
    this.users = [];
    this.assignmentslist = [];
    this.completedassignmentslist = [];
    (<FormControl>this.newagendaliteForm.controls['openingprayer']).setValue('');
    (<FormControl>this.newagendaliteForm.controls['spiritualthought']).setValue('');
    (<FormControl>this.newagendaliteForm.controls['assignments']).setValue('');
    (<FormControl>this.newagendaliteForm.controls['completedassignments']).setValue('');
    (<FormControl>this.newagendaliteForm.controls['closingprayer']).setValue('');

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
    agenda.discussionitems = agenda.discussionitems.replace(/-/gi, '').trim();
    console.log("agenda.discussionitems", agenda.discussionitems)
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

}
