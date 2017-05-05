import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { LoginPage } from '../login/login';

@Component({
  selector: 'forgotpwd-success',
  templateUrl: 'forgotpwd-success.html'
})

export class ForgotPwdSuccess {

constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, public alertCtrl: AlertController) { }

    logIn() {
        this.navCtrl.setRoot(LoginPage, {}, {direction:'right'});
    }

    
}