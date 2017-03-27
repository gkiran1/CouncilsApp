import { Component } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import { LoginPage } from '../pages/login/login';
import { DisplayPage } from '../pages/display/display';
import { CreateAccountPage } from '../pages/create-account/create-account';
import { WelcomePage } from '../pages/menu/menu';
import { InviteMemberPage } from '../pages/invite/invite';
import { NewCouncilPage } from '../pages/new-council/new-council';

//Ionic Push, Push Token Imports
import {
  Push,
  PushToken
} from '@ionic/cloud-angular';


@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})

export class MyApp {
  rootPage: any;

  constructor(platform: Platform, public push: Push, public alertCtrl: AlertController) {
    platform.ready().then(() => {
      StatusBar.styleDefault();

      var securityToken = localStorage.getItem('securityToken');
      var isUserLoggedIn = localStorage.getItem('isUserLoggedIn');

      if ((securityToken == null || securityToken == 'null') &&
        (isUserLoggedIn == 'null' || isUserLoggedIn == null || isUserLoggedIn == 'false')) {
        this.rootPage = LoginPage;
      }
      else {
        this.rootPage = WelcomePage;
      }

      //Push Register to App
<<<<<<< HEAD
       this.push.register().then((t: PushToken) => {
         
      return this.push.saveToken(t);
    }).then((t: PushToken) => {
      
      console.log('Token saved:', t.token);
    });
=======
      this.push.register().then((t: PushToken) => {
        return this.push.saveToken(t);
      }).then((t: PushToken) => {
        console.log('Token saved:', t.token);
      });

      var isPause = false;

      //Handler to Push Messages
      this.push.rx.notification()
        .subscribe((msg) => {
          if (isPause) {
            this.showAlert(msg.title + ': ' + msg.text);
          }
        });
>>>>>>> 3c967acf9bcacec401dcded1890ad0a84eddad7f

      platform.pause.subscribe(() => {
        isPause = true;
      });

      platform.resume.subscribe(() => {
        isPause = false;
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