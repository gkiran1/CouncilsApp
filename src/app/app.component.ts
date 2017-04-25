import { Component } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { LoginPage } from '../pages/login/login';
import { DisplayPage } from '../pages/display/display';
import { CreateAccountPage } from '../pages/create-account/create-account';
import { MenuPage } from '../pages/menu/menu';
import { InviteMemberPage } from '../pages/invite/invite';
import { NewCouncilPage } from '../pages/new-council/new-council';

//Ionic Push, Push Token Imports
import {
  Push,
  PushToken
} from '@ionic/cloud-angular';

let y;
let h;
let offsetY;

@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})



export class MyApp {
  rootPage: any;

  constructor(platform: Platform, public push: Push, public alertCtrl: AlertController) {
    platform.ready().then(() => {

      //Keyboard handler setup
      //this.keyboardSetup();

      //Manually hiding splashscreen
      setTimeout(function () {
        Splashscreen.hide();
      }, 300);

      //Default Statusbar style
      StatusBar.styleDefault();

      //Status overlay set to false
      StatusBar.overlaysWebView(false);

      
      var securityToken = localStorage.getItem('securityToken');
      var isUserLoggedIn = localStorage.getItem('isUserLoggedIn');

      if ((securityToken == null || securityToken == 'null') &&
        (isUserLoggedIn == 'null' || isUserLoggedIn == null || isUserLoggedIn == 'false')) {
        localStorage.setItem('isInstanceCreated', 'false');
        this.rootPage = LoginPage;
      }
      else {
        this.rootPage = MenuPage;
      }

      //Push Register to App

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

      platform.pause.subscribe(() => {
        isPause = true;
        localStorage.setItem('isMenuCentered', '0');
        localStorage.setItem('isInstanceCreated', 'false');
      });

      platform.resume.subscribe(() => {
        isPause = false;
        //localStorage.setItem('isMenuCentered', '0');
      });

    });
  }

  keyboardSetup() {
    window.addEventListener('native.keyboardshow', this.keyboardShowHandler);
    window.addEventListener('native.keyboardhide', this.keyboardHideHandler);
    window.addEventListener('touchstart', this.tapCoordinates);
  }

  keyboardShowHandler(e) {
    let kH = e.keyboardHeight;
    console.log(e.keyboardHeight);
    let bodyMove = <HTMLElement>document.querySelector("ion-app"), bodyMoveStyle = bodyMove.style;
    console.log("calculating " + kH + "-" + offsetY + "=" + (kH - offsetY));

    if (offsetY < kH + 40) {
      bodyMoveStyle.bottom = (kH - offsetY + 40) + "px";
      bodyMoveStyle.top = "initial";
    }
  }

  keyboardHideHandler() {
    console.log('gone');
    let removeStyles = <HTMLElement>document.querySelector("ion-app");
    removeStyles.removeAttribute("style");
  }


  tapCoordinates(e) {
    y = e.touches[0].clientY;
    h = window.innerHeight;
    offsetY = (h - y);
    console.log("offset = " + offsetY);
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