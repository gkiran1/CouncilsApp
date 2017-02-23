import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { User } from '../../user/user';

// import { NavController } from 'ionic-angular';
// import { FormBuilder,  Validators } from '@angular/forms';

@Component({
  templateUrl: 'new-assignment.html'
})
export class NewAssignmentPage {

  users: Array<Object>;
  councils = [];
  assignment = {
    description: '',
    assigneduser: new User,
    assigedcouncil: '',
    date: '',
    time: '',
    createdby: '',
    createddate: '',
    isactive: false, //default false
    lastupdateddate: '',
    notes: ''
  }

  constructor(public appservice: AppService, public firebaseservice: FirebaseService) {
    appservice.getUser().subscribe(user => {
      if (user.isadmin) {
        let subscribe = this.firebaseservice.getUsersByUnitNumber(user.unitnumber).subscribe(users => {
          this.users = users;
          subscribe.unsubscribe();
        });
      } else {
        user.councils.forEach(council => {
          let subscribe = this.firebaseservice.getUsersByCouncil(council).subscribe(users => {
            this.users = users;
            subscribe.unsubscribe();
          });
        });
      }


      this.assignment.createdby = user.createdby;
      this.assignment.createddate = user.createddate;
      this.assignment.isactive = user.isactive;
      this.assignment.lastupdateddate = user.lastupdateddate;
    });
  }
  assignedMemberChange() {
    this.councils = [];
    this.assignment.assigedcouncil = '';
    this.assignment.assigneduser.councils.forEach(key => {
      this.firebaseservice.getCouncilByKey(key).subscribe(council => this.councils.push(...council));
    });

    console.log('member changed', this.assignment.assigneduser, 'councils===>', this.councils);
  }


  cancel() {

  }
  createAssignment() {
    console.log(this.assignment);
  }
}
