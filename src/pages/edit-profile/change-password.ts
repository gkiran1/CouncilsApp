import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { FirebaseService } from '../../environments/firebase/firebase-service';
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
    profile: User;
    password = {
        password: '',
        oldpassword: '',
        newpassword: '',
        confirmnewpassword: ''
    };

    constructor(public navCtrl: NavController, private firebaseService: FirebaseService, public appService: AppService, public alertCtrl: AlertController, ) {
        this.profile = new User;
        appService.getUser().subscribe(user => {
            this.profile.firstname = user.firstname;
            this.profile.lastname = user.lastname;
            this.profile.email = user.email;
            this.profile.ldsusername = user.ldsusername;
            this.profile.password = user.password;
            this.profile.$key = user.$key;
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
    changePassword() {
        //validate the user..to check password is correct or not.
        this.firebaseService.validateUser(this.profile.email, this.password.oldpassword).then(res => {
            // to know the user is signed in or not.           
            //   firebase.auth().onAuthStateChanged((user) => {
            var user = firebase.auth().currentUser;
            if (user) {
                if ((new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/).test(this.password.newpassword))) {
                    if (this.password.newpassword == this.password.confirmnewpassword) {
                        return user.updatePassword(this.password.newpassword).then(res => {
                            this.showAlert('success', 'Your password updated successfully.');
                            this.navCtrl.push(EditProfilePage);
                        })
                            .catch(err => this.showAlert('failure', err.message))
                    }
                    else {
                        this.showAlert('failure', 'Your password is not matching.');
                    }
                }
                else {
                    this.showAlert('failure', ' Your New Password  should be minimum of 6 characters long and must contain atleast one uppercase character and a digit and should not contain any spaces.')
                }
            }
            else {
                this.showAlert('failure', 'user not exist.');
            }
            //  });           
        }).catch(err => this.showAlert('failure', 'your old password is wrong.'))

    }

}