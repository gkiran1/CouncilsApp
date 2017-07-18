import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, NavParams, Loading, ToastController } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Http } from "@angular/http";
import { MenuPage } from '../menu/menu';
import { CreateAccountPage } from '../create-account/create-account';
import { Observable } from 'rxjs/Rx';
import { User } from '../../user/user';
import { NgZone } from '@angular/core';
import { NoAccessPage } from '../noaccess/noaccess.component';
import { ForgotPwd } from '../forgotpwd/forgotpwd';

import { validateEmail } from '../../custom-validators/custom-validator';

declare var FCMPlugin: any;

@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
    providers: [FirebaseService]
})

export class LoginPage {
    show: any = false;
    loading: Loading;
    loginCredentials = { email: '', password: '' };
    user: Observable<User>;
    isValidEmail = true;
    isValidPwd = false;
    emailErr = false;
    loginForm: FormGroup;
    showInValidEml = false;
    showInValidPwd = false;


    constructor(
        public nav: NavController,
        public loadingCtrl: LoadingController,
        public firebaseService: FirebaseService,
        public alertCtrl: AlertController,
        public http: Http,
        private navParams: NavParams,
        private zone: NgZone,
        public toast: ToastController,
        fb: FormBuilder
    ) {

        // this.loginForm = fb.group({
        //     email: ['', Validators.compose([Validators.required, validateEmail])],
        //     password: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
        // });
    }

    keypresssed($event) {
        this.showInValidEml = false;
        this.zone.run(() => {
            if ((new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test($event.target.value))) {
                this.isValidEmail = true;
            }
            else {
                this.isValidEmail = false;
            }
        });
    }

    pwdChange($event) {
        this.showInValidPwd = false;
        this.zone.run(() => {
            if ($event.target.value !== '' && $event.target.value.length >= 6) {
                this.isValidPwd = true;
            } else {
                this.isValidPwd = false;
            }
        });
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
        //this.show = true;
        let loader = this.loadingCtrl.create({
            spinner: 'hide',
            content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
        });
        loader.present();
        let flag = false;
        this.firebaseService.validateUser(loginCredentials.email, loginCredentials.password)
            .then(uid => {
                this.FCMSetup();
                this.firebaseService.getUsersByKey(uid).subscribe(usrs => {
                    if (usrs[0].isactive) {
                        flag = true;
                        localStorage.setItem('Firsttimeinstall', 'false');
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
                });
            })
            .catch(err => {
                this.firebaseService.findUserByEmail(loginCredentials.email).subscribe((usr) => {
                    loader.dismiss();
                    if (usr) {
                        this.showInValidEml = false;
                        this.showInValidPwd = true;
                    }
                    else {
                        this.showInValidEml = true;
                        this.showInValidPwd = false;
                    }
                });
                //this.show = false;
                //this.showAlert('Invalid email or password')
            });

        let v = setInterval(() => {
            if (flag) {
                this.zone.run(() => {
                    this.firebaseService.updateToken(localStorage.getItem('securityToken'));
                    this.nav.setRoot(MenuPage);
                });
                clearInterval(v);
            }
        }, 50);
    }

    showAlert(text) {
        let toast = this.toast.create({
            message: text,
            duration: 3000
        });
        toast.present();
    }

    FCMSetup() {
        if (typeof FCMPlugin != 'undefined') {
            FCMPlugin.onTokenRefresh(function (token) {
                localStorage.setItem('pushtoken', token);
            });
            FCMPlugin.getToken(function (token) {
                localStorage.setItem('pushtoken', token);
            });
        }
        else {
            if (localStorage.getItem('pushtoken') === null) {
                localStorage.setItem('pushtoken', "");
            }
        }
    }

}



