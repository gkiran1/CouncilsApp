import { Component } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import { LoginPage } from '../pages/login/login';
import { DisplayPage } from '../pages/display/display';
import { CreateAccountPage } from '../pages/create-account/create-account';
import { WelcomePage } from '../pages/welcome/welcome';
import { InviteMemberPage } from '../pages/invite/invite';
import { NewCouncilPage } from '../pages/new-council/new-council';
import { NewAssignmentPage } from '../pages/new-assignment/new-assignment';
import { CouncilAssignmentsPage } from '../pages/council-assignments/council-assignments';

//Ionic Push, Push Token Imports
import {
  Push,
  PushToken
} from '@ionic/cloud-angular';


@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class MyApp {
  rootPage = LoginPage;

  constructor(platform: Platform, public push:Push, public alertCtrl: AlertController) {
    platform.ready().then(() => {
      StatusBar.styleDefault();

      //Push Register to App
       this.push.register().then((t: PushToken) => {
      return this.push.saveToken(t);
    }).then((t: PushToken) => {
      console.log('Token saved:', t.token);
    });

    //Handler to Push Messages
    this.push.rx.notification()
      .subscribe((msg) => {
        this.showAlert(msg.title + ': ' + msg.text);
      });
   
    });
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