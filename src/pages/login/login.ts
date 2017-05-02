import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, NavParams, Loading } from 'ionic-angular';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import * as firebase from 'firebase';
import { Headers, Http, Response } from "@angular/http";
import { AuthService } from '../../providers/auth-service';
import { DisplayPage } from '../display/display';
import { MenuPage } from '../menu/menu';
import { CreateAccountPage } from '../create-account/create-account';
import { Observable } from 'rxjs/Rx';
import { User } from '../../user/user';
import { NgZone } from '@angular/core';
import { NoAccessPage } from '../noaccess/noaccess.component';
import { ForgotPwd } from '../forgotpwd/forgotpwd';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
    providers: [FirebaseService]
})

export class LoginPage {
    loading: Loading;
    loginCredentials = { email: '', password: '' };
    user: Observable<User>;
    constructor(
        public nav: NavController,
        public loadingCtrl: LoadingController,
        public firebaseService: FirebaseService,
        public alertCtrl: AlertController,
        public http: Http,
        private navParams: NavParams,
        private zone: NgZone) {
    }

    public forgotPassword() {
        this.nav.push(ForgotPwd);
    }

    noAccount() {
        this.nav.push(CreateAccountPage);
    }

    public login() {
        this.validateUser(this.loginCredentials);
    }

    private validateUser(loginCredentials) {
        let loader = this.loadingCtrl.create({
            spinner:'hide',
            content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
        });
        loader.present();
        let flag = false;
        this.firebaseService.validateUser(loginCredentials.email, loginCredentials.password)
            .then(uid => {
                this.firebaseService.getUsersByKey(uid).subscribe(usrs => {
                    if (usrs[0].isactive) {
                        flag = true;
                        localStorage.setItem('securityToken', uid);
                        localStorage.setItem('isUserLoggedIn', 'true');
                        localStorage.setItem('isMenuCentered', '0');
                        localStorage.setItem('isAdmin', usrs[0].isadmin.toString());
                    }
                    else {
                        this.zone.run(() => {
                            this.nav.setRoot(NoAccessPage);
                        });
                    }
                    loader.dismiss();
                })

            })
            .catch(err => {
                loader.dismiss();
                this.showAlert('failure', 'Your Emailid or Password is incorrect.')
            });



        let v = setInterval(() => {
            if (flag) {
                this.zone.run(() => {
                    this.nav.setRoot(MenuPage);
                });
                clearInterval(v);
            }
        }, 50);
    }

    showAlert(reason, text) {
        let alert = this.alertCtrl.create({
            title: '',
            subTitle: text,
            buttons: ['OK']
        });
        alert.present();
    }

}



