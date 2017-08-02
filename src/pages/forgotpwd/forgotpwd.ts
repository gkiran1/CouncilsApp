import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ForgotPwdSuccess } from './forgotpwd-success';
import { FirebaseService } from '../../environments/firebase/firebase-service';

@Component({
    selector: 'forgot-pwd',
    templateUrl: 'forgotpwd.html',
    providers: [FirebaseService]
})

export class ForgotPwd {

    email: any;
    isValidEmail = false;
    showInValidEml = false;

    constructor(public navCtrl: NavController,
        public loadingCtrl: LoadingController,
        public alertCtrl: AlertController,
        public firebaseService: FirebaseService) { }


    keypresssed($event) {
        this.showInValidEml = false;
        if ((new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test($event.target.value))) {
            this.isValidEmail = true;
        }
        else {
            this.isValidEmail = false;
        }
    }

    sendEmail() {
        if (this.email !== '') {
            let loader = this.loadingCtrl.create({
                spinner: 'hide',
                content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
            });

            loader.present();

            this.firebaseService.sendForgotEmailLink(this.email).then(() => {
                loader.dismiss();
                this.navCtrl.push(ForgotPwdSuccess);
            }).catch((err) => {
                loader.dismiss();
                this.showInValidEml = true;
            });
        }
    }

    cancel() {
        this.navCtrl.pop();
    }

}