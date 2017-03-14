import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AlertController, NavController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../menu/menu';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  templateUrl: 'agenda.html',
  selector: 'page-agenda'
})
export class AgendaPage {
  minDate = moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');
  users = [];
  councils = [];
  agendaForm: FormGroup;
  usercouncils = [];
  agendaKey = '';

  constructor(navParams: NavParams, fb: FormBuilder, public appservice: AppService,
    public firebaseservice: FirebaseService, public alertCtrl: AlertController,
    public nav: NavController) {

    let agenda = navParams.get('agendaselected');
    this.agendaKey = agenda.$key;

    console.log("agenda", agenda.$key);    
    console.log("agenda", agenda);

    var councilsIds = localStorage.getItem('userCouncils').split(',');
    councilsIds.forEach(councilId => {
      this.firebaseservice.getCouncilByKey(councilId).subscribe(councilObj => {
        if (councilObj[0].$key === agenda.councilid) {
          (<FormControl>this.agendaForm.controls['assignedcouncil']).setValue(councilObj[0]);
        }
        this.councils.push(...councilObj);
      });
    });

    this.users = [];
    this.getUsersByCouncilId(agenda.councilid).subscribe(usersObj => {
      usersObj.forEach(usrObj => {
        this.firebaseservice.getUsersByKey(usrObj.userid).subscribe(usrs => {
          if (usrs[0].$key === agenda.openinghymn) {
            (<FormControl>this.agendaForm.controls['openinghymn']).setValue(usrs[0]);
          }
          if (usrs[0].$key === agenda.openingprayer) {
            (<FormControl>this.agendaForm.controls['openingprayer']).setValue(usrs[0]);
          }
          if (usrs[0].$key === agenda.spiritualthought) {
            (<FormControl>this.agendaForm.controls['spiritualthought']).setValue(usrs[0]);
          }
          if (usrs[0].$key === agenda.highcounselorremarks) {
            (<FormControl>this.agendaForm.controls['highcounselorremarks']).setValue(usrs[0]);
          }
          if (usrs[0].$key === agenda.reviewassignments) {
            (<FormControl>this.agendaForm.controls['reviewassignments']).setValue(usrs[0]);
          }
          this.users.push(usrs[0]);
        });
      });
    });

    this.agendaForm = fb.group({
      assignedcouncil: ['', Validators.required],
      assigneddate: [agenda.agendadate, Validators.required],
      assignedtime: [agenda.agendatime, Validators.required],
      openinghymn: ['', Validators.required],
      openingprayer: ['', Validators.required],
      spiritualthought: ['', Validators.required],
      highcounselorremarks: ['', Validators.required],
      reviewassignments: ['', Validators.required],
      createdby: agenda.createdby,
      createddate: agenda.createddate,
      isactive: agenda.isactive,
      lastupdateddate: '',

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


  cancel() {
    this.nav.setRoot(WelcomePage);
  }

  formatAgendaObj(value) {
    return {
      assignedcouncil: value.assignedcouncil,
      assigneddate: moment(value.assigneddate + ' ' + value.assignedtime, "YYYY-MM-DD hh:mmA").toISOString(),
      openinghymn: value.openinghymn,
      openingprayer: value.openingprayer,
      spiritualthought: value.spiritualthought,
      highcounselorremarks: value.highcounselorremarks,
      reviewassignments: value.reviewassignments,
      createdby: value.createdby,
      createddate: new Date().toISOString(),
      isactive: value.isactive,
      lastupdateddate: new Date().toISOString()
    }
  }

  edit(value) {
    let formattedAgendaObj = this.formatAgendaObj(value);
    this.firebaseservice.updateAgenda(formattedAgendaObj, this.agendaKey)
      .then(res => {this.showAlert('Agenda has been updated.');this.nav.pop(); })
      .catch(err => {this.showAlert('Unable to updated the Agenda, please try after some time.')})
  }

  delete() {
    this.firebaseservice.removeAgenda(this.agendaKey)
      .then(res => {this.showAlert('Agenda has been deleted.'); this.nav.pop(); })
      .catch(err => {this.showAlert('Unable to delete the Agenda, please try after some time.')})
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
