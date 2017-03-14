import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AlertController, NavController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../menu/menu';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  templateUrl: 'new-blankagenda.html',
  selector: 'new-blankagenda'
})
export class NewBlankAgendaPage {
  minDate = moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');
  users = [];
  councils = [];
  blankagendaForm: FormGroup;
  usercouncils = [];


  constructor(navParams: NavParams, fb: FormBuilder, public appservice: AppService,
    public firebaseservice: FirebaseService, public alertCtrl: AlertController,
    public nav: NavController) {

    var councilsIds = localStorage.getItem('userCouncils').split(',');
    councilsIds.forEach(councilId => {
      this.firebaseservice.getCouncilByKey(councilId).subscribe(councilObj => {
        this.councils.push(...councilObj);
      })
    })

    this.blankagendaForm = fb.group({
      assignedcouncil: ['', Validators.required],
      assigneddate: [moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'), Validators.required],
      assignedtime: ['', Validators.required],
      openinghymn: ['', Validators.required],
      openingprayer: ['', Validators.required],
      spiritualthought: ['', Validators.required],
      highcounselorremarks: ['', Validators.required],
      reviewassignments: ['', Validators.required],
      createdby: localStorage.getItem('securityToken'),
      createddate: new Date().toDateString(),
      isactive: true,
      lastupdateddate: ''
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
  }

  getUsersByCouncilId(councilId: string) {
    return this.firebaseservice.getUsersByCouncil(councilId);
  }

  updateCouncils(councils) {
    councils.usercouncils.forEach(councilid => {
      this.firebaseservice.getUsersByCouncil(councilid).subscribe(usercouncils => this.usercouncils.push(...usercouncils));
    });
  }

  agendasArray = [];
  createagenda(agenda) {
    // Main Code
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

}
