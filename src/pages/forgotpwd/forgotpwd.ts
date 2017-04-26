import { Component } from '@angular/core';

import { NavController, LoadingController } from 'ionic-angular';

import { NewAssignmentPage } from '../new-assignment/new-assignment';
import { AppService } from '../../providers/app-service';
import { FirebaseConfig } from '../../environments/firebase/firebase-config';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import * as firebase from 'firebase';
import { User } from '../../user/user';
import { Invitee } from '../invite/invitee.model';
import { Observable, Subject } from "rxjs/Rx";
import { AlertController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { ForgotPwdSuccess } from './forgotpwd-success';
import { EmailService } from '../../providers/emailservice';


@Component({
  selector: 'forgot-pwd',
  templateUrl: 'forgotpwd.html',
  providers: [EmailService]
})




export class ForgotPwd {
    
    email:any;
    constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, public alertCtrl: AlertController, public emailService: EmailService) { }

    sendEmail() {

        if(this.email !== '') {
             let loader = this.loadingCtrl.create({
                spinner: 'dots',
            });

            loader.present();
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
            
            
        }
    }
}