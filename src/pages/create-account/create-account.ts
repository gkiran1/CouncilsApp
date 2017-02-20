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
import { WelcomePage } from '../welcome/welcome';
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

    // username@domain.com

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
        this.newUser.isadmin = false;
        this.newUser.createdby = invitee.createdby;
        this.newUser.createddate = '';
        this.newUser.lastupdateddate = invitee.lastupdateddate;
        this.newUser.isactive = true;

        // after verifying and filling properties create new user.
        this.firebaseService.signupNewUser(this.newUser)
          .then(res => {
            //onSuccess redirect to welcome page
            this.showAlert('success', 'Account Created Successfully..<br/> Redirecting to login Page..');
            //this.navCtrl.push(WelcomePage);
          })
          .catch(err => this.showAlert('failure', err.message))

      } else {
        this.showAlert('failure', 'you are not invited!');
      }

    });
  }

  showAlert(reason, text) {
    let alert = this.alertCtrl.create({
      title: '',
      subTitle: text,
      buttons: ['OK']
    });
    alert.present();
    if (reason === 'success') this.navCtrl.push(LoginPage);
  }


  cancel() {
    //this.navCtrl.setRoot(WelcomePage);
    this.navCtrl.setRoot(NewAssignmentPage);
  }

}
