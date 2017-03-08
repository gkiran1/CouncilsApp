import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { NewAssignmentPage } from '../new-assignment/new-assignment';
import { AppService } from '../../providers/app-service';
import { FirebaseConfig } from '../../environments/firebase/firebase-config';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import * as firebase from 'firebase';
import { User } from '../../user/user';
import { Invitee } from '../invite/invitee.model';
import { Observable, Subject } from "rxjs/Rx";
import { WelcomePage } from '../menu/menu';
import { AlertController } from 'ionic-angular';
import { LoginPage } from '../login/login';

@Component({
  templateUrl: 'create-account.html'
})

export class CreateAccountPage {

  invitee$: Observable<Invitee>;
  //user$: Observable<User> todo: R & D
  newUser: User = new User;
  createAccountForm;

  constructor(public navCtrl: NavController, public firebaseService: FirebaseService, public alertCtrl: AlertController) { }

  createAccount() {
    // password validation
        if (!(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/).test(this.newUser.password))) {
            this.showAlert('failure', 'Password  should be minimum of 6 characters long and must contain atleast one uppercase character and a digit and should not contain any spaces.')
        }
    // username@domain.com
    else{
    this.invitee$ = this.firebaseService.findInviteeByEmail(this.newUser.email);
    this.invitee$.subscribe(invitee => {

      if (invitee) {
        this.newUser.firstname = invitee.firstname;
        this.newUser.lastname = invitee.lastname;


        //email is already der in user   
        //password is already der in user
        //lds org name is already der in user

        this.newUser.unittype = invitee.unittype;
        this.newUser.unitnumber = invitee.unitnumber;
        this.newUser.avatar = "avatar"; // time being hard coded..later need to work..
        this.newUser.councils = invitee.councils;
        this.newUser.calling = invitee.calling;
        this.newUser.isadmin = false;
        this.newUser.createdby = invitee.createdby;
        this.newUser.createddate = '';
        this.newUser.lastupdateddate = invitee.lastupdateddate;
        this.newUser.isactive = true;

        // after verifying and filling properties create new user.
        let flag = false;
        this.firebaseService.signupNewUser(this.newUser)
          .then(res => {
            //onSuccess redirect to welcome page
            flag = true;

          })
          .catch(err => this.showAlert('failure', err.message));
        let v = setInterval(() => {
          if (flag) {
            this.showAlert('success', 'Account Created Successfully..<br/> Redirecting to login Page..');
            this.navCtrl.push(LoginPage);
            clearInterval(v);
          }
        }, 50);

      } else {
        this.showAlert('failure', 'You are not invited!');
      }

    });
    }
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
    this.navCtrl.pop();
  }

}
