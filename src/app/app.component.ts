import { Component } from '@angular/core';
import { Platform, AlertController, ToastController } from 'ionic-angular';
import { StatusBar, Splashscreen, Keyboard } from 'ionic-native';
import { LoginPage } from '../pages/login/login';
import { MenuPage } from '../pages/menu/menu';
import { NewMenuPage } from '../pages/newmenu/newmenu';
import { FirebaseService } from '../environments/firebase/firebase-service';
import { Observable } from 'rxjs/Observable';
import { ConnectivityService } from '../providers/connectivityservice';
import { NativeAudio } from '@ionic-native/native-audio';

let y;
let h;
let offsetY;

@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`,
  providers: [FirebaseService, ConnectivityService]
})

export class MyApp {
  rootPage: any;
  securityToken;
  isUserLoggedIn;

  constructor(platform: Platform,
    public alertCtrl: AlertController,
    public toast: ToastController,
    public firebaseService: FirebaseService,
    private nativeAudio: NativeAudio) {

    platform.ready().then(() => {
      Keyboard.hideKeyboardAccessoryBar(false);
      this.addConnectivityListeners();

      //Load Audio
      this.nativeAudio.preloadSimple('chime','assets/audio/chime.mp3');
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

      this.securityToken = localStorage.getItem('securityToken');
      this.isUserLoggedIn = localStorage.getItem('isUserLoggedIn');

      if ((this.securityToken == null || this.securityToken == 'null') &&
        (this.isUserLoggedIn == 'null' || this.isUserLoggedIn == null || this.isUserLoggedIn == 'false')) {
        localStorage.setItem('childAdded', 'false');
        localStorage.setItem('gcToken', 'null');
        this.rootPage = LoginPage;
      }
      else {
        this.rootPage = MenuPage;
      }

      var isPause = false;

      platform.pause.subscribe(() => {
        isPause = true;
        localStorage.setItem('isMenuCentered', '0');
        localStorage.setItem('childAdded', 'false');
      });

      platform.resume.subscribe(() => {
        isPause = false;
        //localStorage.setItem('isMenuCentered', '0');
      });

    });
  }

  addConnectivityListeners() {

    let onOnline = () => {

      let offlinemessage = this.offlineToast().instance;
      if (offlinemessage != null)
        offlinemessage.dismiss();

      let onlinemessage = this.onlineToast();
      onlinemessage.present();

    };

    let onOffline = () => {
      let onlinemessage = this.onlineToast().instance;
      if (onlinemessage != null)
        onlinemessage.dismiss();

      let offlinemessage = this.offlineToast();
      offlinemessage.present();
    };

    document.addEventListener('online', onOnline, false);
    document.addEventListener('offline', onOffline, false);
  }

  offlineToast() {
    //if(state = 'offline')
    return this.toast.create({
      message: "Offline",
      duration: 3000
    });
  }

  onlineToast() {
    //if(state = 'offline')
    return this.toast.create({
      message: "Online",
      duration: 3000
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