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
  currentUser: any;
  users: any;
  newCouncil: Council = new Council();

  constructor(public af: AngularFire, public firebaseservice: FirebaseService, public appservice: AppService) {
    this.appservice.getUser().subscribe(user => {
      this.currentUser = user;
      let subscribe = this.firebaseservice.getUsersByUnitNumber(user.unitnumber).subscribe(users => {
        this.users = users;
        subscribe.unsubscribe();
      });
    });
  }

  createCouncil() {
    this.newCouncil.counciltype = this.currentUser.unittype;
    this.firebaseservice.createCouncils(this.newCouncil).then(res => {
      if (res != false) {
        this.currentUser.councils.push(res);
        this.firebaseservice.createUserCouncils(this.currentUser.$key, res);
        this.firebaseservice.updateCouncilsInUser(this.currentUser.$key, this.currentUser.councils);

        this.users.forEach(user => {
          if (user.selected === true) {
            this.firebaseservice.createUserCouncils(user.$key, res);
            user.councils.push(res);
            this.firebaseservice.updateCouncilsInUser(user.$key, user.councils);
          }
        });
      }
      else {
        alert('Council already exists.');
      }
    }).catch(err => {
      alert(err);
    })
  }

}




