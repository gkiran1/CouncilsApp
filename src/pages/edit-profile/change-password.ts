import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService } from '../../providers/app-service';
import { User } from '../../user/user';
import * as firebase from 'firebase';
import { EditProfilePage } from '../edit-profile/edit-profile';

@Component({
    selector: 'change-password',
    templateUrl: 'change-password.html',
    providers: [FirebaseService]
})
export class ChangePasswordPage {
    changePasswordForm: FormGroup;
    profile: User;
    newpasswordErr = false;
    password = {
        password: '',
        oldpassword: '',
        newpassword: '',
        confirmnewpassword: ''
    };
    oldPwdError = false;
    newPwdError = false;
    confirmPwdError = false;

    constructor(fb: FormBuilder, public navCtrl: NavController, private firebaseService: FirebaseService, public appService: AppService, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public toast: ToastController) {
        this.profile = new User;
        appService.getUser().subscribe(user => {
            this.profile.firstname = user.firstname;
            this.profile.lastname = user.lastname;
            this.profile.email = user.email;
            this.profile.ldsusername = user.ldsusername;
            this.profile.password = user.password;
            this.profile.$key = user.$key;
        });
        this.changePasswordForm = fb.group({
            oldpassword: ['', Validators.required],
            newpassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
            confirmnewpassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])],

        });
    }
    showAlert(text) {
        // let alert = this.alertCtrl.create({
        //     title: '',
        //     subTitle: text,
        //     buttons: ['OK']
        // });
        // alert.present();

        let toast = this.toast.create({
            message: text,
            duration: 3000
        })

        toast.present();
    }
    cancel() {
        this.navCtrl.pop({ animate: true, animation: 'transition', direction: 'back' });
    }
    newPwdKeypress($event) {
        if (this.password.newpassword.includes(' ')) {
            this.newPwdError = true;
        } else {
            this.newPwdError = false;
        }
    }
    confirmPwdKeypress($event) {
        if (this.password.newpassword === this.password.confirmnewpassword || this.password.newpassword.includes(this.password.confirmnewpassword)) {
            this.confirmPwdError = false;
        } else {
            this.confirmPwdError = true;
        }
    }
    changePassword() {
        let loader = this.loadingCtrl.create({
            spinner: 'hide',
            content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
        });
        loader.present();
        //validate the user..to check password is correct or not.
        this.firebaseService.validateUser(this.profile.email, this.password.oldpassword).then(res => {
            this.oldPwdError = false;
            // to know the user is signed in or not.           
            //   firebase.auth().onAuthStateChanged((user) => {
            var user = firebase.auth().currentUser;
            if (user) {
                if ((new RegExp(/[^\s.]{6}$/).test(this.password.newpassword))) {
                    if (this.password.newpassword == this.password.confirmnewpassword) {
                        return user.updatePassword(this.password.newpassword).then(res => {
                            loader.dismiss();
                            // this.showAlert('success', 'Your password updated successfully.');
                            this.navCtrl.pop({ animate: true, animation: 'transition', direction: 'back' });
                        })
                            .catch(err => {
                                loader.dismiss();
                                this.showAlert('Connection error');
                            })
                    }
                    else {
                        loader.dismiss();
                        // this.showAlert('confirm password does not match');
                    }
                }
                else {
                    loader.dismiss();
                    // this.showAlert('no space allowed')
                }
            }
            else {
                loader.dismiss();
                // this.showAlert('user not exist');
            }
            //  });           
        }).catch(err => {
            loader.dismiss();
            this.oldPwdError = true;
            // this.showAlert('invalid password')
        })

    }

}