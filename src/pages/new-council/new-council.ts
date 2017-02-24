import { Component } from '@angular/core';
import { FirebaseConfig } from '../../environments/firebase/firebase-config';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AppService } from '../../providers/app-service';
import * as firebase from 'firebase';
import { User } from '../../user/user';
import { Observable } from 'rxjs/Rx';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { Council } from './council'


@Component({
  selector: 'new-council',
  templateUrl: 'new-council.html'
})

export class NewCouncilPage {
  // users: FirebaseObjectObservable<any>;
  users: any;
  newCouncil: Council = new Council();
  unittype: string


  constructor(public af: AngularFire, public firebaseservice: FirebaseService, public appservice: AppService) {
    //  this.af.auth.subscribe(auth => {
    //       this.userObj = this.af.database.object('/users/' + auth.uid);
    this.appservice.getUser().subscribe(user => {
      console.log("user==",user);
      this.unittype = user.unittype;
      let subscribe = this.firebaseservice.getUsersByUnitNumber(user.unitnumber).subscribe(users => {
        this.users = users;

        subscribe.unsubscribe();
      });
    });
  }

  createCouncil() {
    var selectedUserIds: string[] = [];

    this.newCouncil.counciltype = this.unittype;

    this.users.forEach(user => {
      if (user.selected === true) {
        selectedUserIds.push(user.$key);
      }
    });

    this.firebaseservice.createCouncils(this.newCouncil).then(res => {
      if (res != false) {
        selectedUserIds.forEach(usrId => {
          this.firebaseservice.createUserCouncils(usrId, res);
        })
      }
      else {
        alert('Council already exists.');
      }
    }).catch(err => {
      alert(err);
    })
  }

}




