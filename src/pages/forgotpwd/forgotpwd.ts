import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ForgotPwdSuccess } from './forgotpwd-success';
import { EmailService } from '../../providers/emailservice';

@Component({
    selector: 'forgot-pwd',
    templateUrl: 'forgotpwd.html',
    providers: [EmailService]
})

export class ForgotPwd {

    email: any;
    constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, public alertCtrl: AlertController, public emailService: EmailService) { }

    sendEmail() {

        if (this.email !== '') {
            let loader = this.loadingCtrl.create({
                spinner: 'hide',
                content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
            });

            loader.present();

            // Uncomment this code when email service works. 

            this.emailService.emailForgotPassword(this.email).subscribe(res => {
                if (res.status === 200) {
                    loader.dismiss();
                    this.navCtrl.push(ForgotPwdSuccess);
                }
                else {
                    loader.dismiss();
                    alert("Mail sending Failed. Please check your email and try")
                }
            });

            //Comment this code when email service works.

            // loader.dismiss();
            // this.navCtrl.push(ForgotPwdSuccess);
        }
    }
    cancel() {
        this.navCtrl.pop();
    }

}