import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
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
    password = {
        password: '',
        oldpassword: '',
        newpassword: '',
        confirmnewpassword: ''
    };

    constructor(fb: FormBuilder, public navCtrl: NavController, private firebaseService: FirebaseService, public appService: AppService, public alertCtrl: AlertController, public loadingCtrl: LoadingController, ) {
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
            newpassword: ['', Validators.required],
            confirmnewpassword: ['', Validators.required],

        });
    }
    showAlert(reason, text) {
        let alert = this.alertCtrl.create({
            title: '',
            subTitle: text,
            buttons: ['OK']
        });
        alert.present();
    }
    cancel() {
        this.navCtrl.pop({animate: true, animation: 'transition', direction:'back'});
    }
    changePassword() {
        let loader = this.loadingCtrl.create({
            spinner: 'dots',
        });
        loader.present();
        //validate the user..to check password is correct or not.
        this.firebaseService.validateUser(this.profile.email, this.password.oldpassword).then(res => {
            // to know the user is signed in or not.           
            //   firebase.auth().onAuthStateChanged((user) => {
            var user = firebase.auth().currentUser;
            if (user) {
                if ((new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/).test(this.password.newpassword))) {
                    if (this.password.newpassword == this.password.confirmnewpassword) {
                        return user.updatePassword(this.password.newpassword).then(res => {
                            loader.dismiss();
                            this.showAlert('success', 'Your password updated successfully.');
                            this.navCtrl.push(EditProfilePage);
                        })
                            .catch(err => {
                                loader.dismiss();
                                this.showAlert('failure', err.message)
                            })
                    }
                    else {
                        loader.dismiss();
                        this.showAlert('failure', 'Your password is not matching.');
                    }
                }
                else {
                    loader.dismiss();
                    this.showAlert('failure', ' Your New Password  should be minimum of 6 characters long and must contain atleast one uppercase character and a digit and should not contain any spaces.')
                }
            }
            else {
                loader.dismiss();
                this.showAlert('failure', 'user not exist.');
            }
            //  });           
        }).catch(err => {
            loader.dismiss();
            this.showAlert('failure', 'your old password is wrong.')
        })

    }

}