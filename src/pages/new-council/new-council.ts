import { Component } from '@angular/core';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AngularFire } from 'angularfire2';
import { Council } from './council'
import { AlertController, NavController, ToastController } from 'ionic-angular';
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
  isValidCouncil = true;

  constructor(public af: AngularFire, public firebaseservice: FirebaseService, public nav: NavController, public alertCtrl: AlertController, public toast: ToastController) {
    // this.appservice.getUser().subscribe(user => {
    this.userSubscription = this.af.auth.subscribe(auth => {
      if (auth !== null) {
        this.af.database.object('/users/' + auth.uid).subscribe(user => {
          this.currentUser = user;
          this.firebaseservice.getUsersByUnitNumber(user.unitnumber).subscribe(users => {
            this.users = users.filter(userObj => {
              if (userObj && userObj.isactive === true) {
                // var userCouncilNames: string[] = [];
                // userObj.councils.forEach(councilId => {
                //   this.firebaseservice.getCouncilByKey(councilId).subscribe((councilObj) => {
                //     userCouncilNames.push(councilObj[0].council);
                //     userObj.councilnames = userCouncilNames.join(', ');
                //   });
                // });
                this.firebaseservice.checkNetworkStatus(userObj.$key, function (status) {
                  userObj.status = status ? '#3cb18a' : '#a9aaac';
                });
                return userObj;
              }
            });
            this.users.sort(function (a, b) {
              return (a.status === '#3cb18a' && b.status === '#a9aaac') ? -1 : ((a.status === '#a9aaac' && b.status === '#3cb18a') ? 1 : 0);
            });
          });
        });
      }
    });
  }
  cancel() {
    this.nav.pop({ animate: true, animation: 'transition', direction: 'back' });
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

        this.selectedUsers.forEach(user => {
          if (user.selected) {
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
    }).catch(err => this.showAlert('Connection error.'))

  }

  selectedUsers = [];
  userToggle(event, user) {
    if (event.checked) {
      this.selectedUsers.push(user)
    } else {
      this.selectedUsers.forEach((u, i) => {
        if (u.$key === user.$key) {
          this.selectedUsers.splice(i, 1);
        }
      })
    }
  }

  showAlert(errText) {
    // let alert = this.alertCtrl.create({
    //   title: '',
    //   subTitle: errText,
    //   buttons: ['OK']
    // });
    // alert.present();

    let toast = this.toast.create({
      message: errText,
      duration: 3000,
      position: 'top'
    })

    toast.present();
  }

  keypressed($event) {
    $event.target.value.trim() === '' ? this.isValidCouncil = false : this.isValidCouncil = true;
  }

}




