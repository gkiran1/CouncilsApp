import { Component } from '@angular/core';
import { FirebaseConfig } from '../../environments/firebase/firebase-config';
import { FirebaseService } from '../../environments/firebase/firebase-service';

import * as firebase from 'firebase';
import { User } from '../../user/user';
import { Observable } from 'rxjs/Rx';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { Council } from './council'
import { AlertController, NavController } from 'ionic-angular';
import { Subscription } from "rxjs";

@Component({
  selector: 'new-createcouncil',
  templateUrl: 'new-council.html'
})

export class NewCouncilPage {
  currentUser: any;
  users: any;
  newCouncil: Council = new Council();
  userCouncils: any;
  userSubscription: Subscription;

  constructor(public af: AngularFire, public firebaseservice: FirebaseService, public nav: NavController, public alertCtrl: AlertController) {
    // this.appservice.getUser().subscribe(user => {
    this.userSubscription = this.af.auth.subscribe(auth => {
      if (auth !== null) {
        this.af.database.object('/users/' + auth.uid).subscribe(user => {
          this.currentUser = user;
          this.firebaseservice.getUsersByUnitNumber(user.unitnumber).subscribe(users => {
            users.forEach(usr => {
              var userCouncilNames: string[] = [];
              usr.councils.forEach(e => {
                this.firebaseservice.getCouncilByKey(e).subscribe((councilObj) => {
                  councilObj.forEach(counObj => {
                    userCouncilNames.push(councilObj[0].council);
                    usr.councilnames = userCouncilNames.join(', ');
                  });
                });
              });
            });
            this.users = users;
            //subscribe.unsubscribe();
          });
        });
      }
    });
  }
  cancel() {
    this.nav.pop();
  }

  createCouncil() {
    this.newCouncil.counciltype = this.currentUser.unittype;
    this.newCouncil.unitnumber = this.currentUser.unitnumber;
    this.firebaseservice.createCouncils(this.newCouncil).then(res => {
      if (res != false) {
        this.currentUser.councils.push(res);
        this.firebaseservice.createUserCouncils(this.currentUser.$key, res);
        this.firebaseservice.updateCouncilsInUser(this.currentUser.$key, this.currentUser.councils);
        localStorage.setItem('userCouncils', this.currentUser.councils.toString());

        this.users.forEach(user => {
          if (user.selected === true) {
            this.firebaseservice.createUserCouncils(user.$key, res);
            user.councils.push(res);
            this.firebaseservice.updateCouncilsInUser(user.$key, user.councils);
          }
        });
        this.nav.popToRoot();
      }
      else {
        this.showAlert('Council already exists.');
      }
    }).catch(err => this.showAlert(err))

  }

  showAlert(errText) {
    let alert = this.alertCtrl.create({
      title: '',
      subTitle: errText,
      buttons: ['OK']
    });
    alert.present();
  }


}




