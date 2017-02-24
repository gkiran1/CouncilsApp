import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { User } from '../../user/user';

import { AlertController, NavController } from 'ionic-angular';
import { WelcomePage } from '../welcome/welcome';


@Component({
  templateUrl: 'new-assignment.html'
})
export class NewAssignmentPage {

  users: Array<Object>;
  councils = [];
  assignment = {
    description: '',
    assigneduser: '',
    assignedcouncil: '',
    assigneddate: new Date(),
    assignedtime: new Date(),
    createdby: '',
    createddate: '',
    isactive: false, //default false
    lastupdateddate: '',
    notes: ''
  }
  //This is required to store assingeduser object in UI inorder to fetch related councils.
  temp = {
    assigneduser: new User,
  }
  usercouncils = [];
  arrayWithUserKeys = [];


  constructor(public appservice: AppService, public firebaseservice: FirebaseService, public alertCtrl: AlertController, public nav: NavController) {
    appservice.getUser().subscribe(user => {
      let subscribe = this.firebaseservice.getUsersByUnitNumber(user.unitnumber).subscribe(users => {
        this.users = users;
        subscribe.unsubscribe();
      });
      // if (user.isadmin) {
      //   let subscribe = this.firebaseservice.getUsersByUnitNumber(user.unitnumber).subscribe(users => {
      //     this.users = users;
      //     subscribe.unsubscribe();
      //   });
      // } else {
      //   user.councils.forEach(council => {
      //     let subscribe = this.firebaseservice.getUsersByCouncil(council).subscribe(users => {
      //       this.usercouncils.push(...users);
      //       console.log(this.usercouncils);
      //       this.usercouncils.forEach(e => this.arrayWithUserKeys.push(e.userid));
      //       this.arrayWithUserKeys = this.arrayWithUserKeys.filter((e, i, self) => self.indexOf(e) === i);
      //       // this.arrayWithUserKeys.forEach(userkey=>);
      //       subscribe.unsubscribe();
      //     });
      //   });
      // }

      this.assignment.createdby = user.$key;
      this.assignment.isactive = user.isactive;
    });
  }
  assignedMemberChange() {
    this.councils = [];
    this.assignment.assigneduser = this.temp.assigneduser.$key;
    this.assignment.assignedcouncil = '';

    this.temp.assigneduser.councils.forEach(key => {
      this.firebaseservice.getCouncilByKey(key).subscribe(council => this.councils.push(...council));
    });

    console.log('member changed', this.assignment.assigneduser, 'councils===>', this.councils);
  }


  cancel() {
    this.nav.setRoot(WelcomePage);
  }
  createAssignment() {
    let formattedAssignmentObj = {

      assigneddate: new Date(this.assignment.assigneddate).toDateString(),
      assignedtime: new Date(this.assignment.assignedtime).toTimeString(),
      createddate: new Date().toDateString(),
      lastupdateddate: new Date().toDateString(),

      createdby: this.assignment.createdby,
      description: this.assignment.description,
      assigneduser: this.assignment.assigneduser,
      assignedcouncil: this.assignment.assignedcouncil,
      isactive: this.assignment.isactive,
      notes: this.assignment.notes
    }

    this.firebaseservice.createAssigment(formattedAssignmentObj)
      .then(res => { this.showAlert('Assignment created successfully..'); this.nav.setRoot(WelcomePage) })
      .catch(err => this.showAlert(err))
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
