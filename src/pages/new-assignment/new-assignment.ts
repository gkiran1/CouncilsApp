import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { User } from '../../user/user';

import { AlertController, NavController } from 'ionic-angular';
import { WelcomePage } from '../welcome/welcome';
import { Council } from '../new-council/council'
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  templateUrl: 'new-assignment.html',
  selector: 'new-assignment-page'
})
export class NewAssignmentPage {
  minDate = moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');
  users: Array<Object>;
  councils = [];
  assignmentForm: FormGroup;
  //This is required to store assingeduser object in UI inorder to fetch related councils.
  usercouncils = [];
  arrayWithUserKeys = [];


  constructor(fb: FormBuilder, public appservice: AppService, public firebaseservice: FirebaseService, public alertCtrl: AlertController, public nav: NavController) {
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


      this.assignmentForm = fb.group({
        description: ['', Validators.required],
        assigneduser: ['', Validators.required],
        assignedcouncil: [new Council(), Validators.required],
        assigneddate: [moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'), Validators.required],
        assignedtime: ['', Validators.required],
        createdby: user.$key,
        createddate: '',
        isactive: false, //default false
        lastupdateddate: '',
        notes: ''
      });

    });
  }
  assignedMemberChange(value) {
    this.councils = [];
    (<FormControl>this.assignmentForm.controls['assignedcouncil']).setValue(new Council());
    value.assigneduser.councils.forEach(key => {
      this.firebaseservice.getCouncilByKey(key).subscribe(council => this.councils.push(...council));
    });
    console.log('member changed::', value);
  }

  cancel() {
    this.nav.setRoot(WelcomePage);
  }

  createAssignment(value) {
    console.log('======================>assignmentForm.value', value);
    let formattedAssignmentObj = {

      assigneddate: moment(value.assigneddate + ' ' + value.assignedtime, "YYYY-MM-DD hh:mmA").toISOString(),
      createddate: new Date().toISOString(),
      lastupdateddate: new Date().toISOString(),

      createdby: value.createdby,
      description: value.description,
      assigneduser: value.assigneduser.$key,
      councilid: value.assignedcouncil.$key,
      councilname: value.assignedcouncil.council,
      isactive: value.isactive,
      notes: value.notes
    }
    console.log('======================>formattedAssignmentObj', formattedAssignmentObj);
    if (moment(formattedAssignmentObj.assigneddate).isBefore(moment())) {
      this.showAlert('Assignment Date/Time cannot be in past');
    } else {
      this.firebaseservice.createAssigment(formattedAssignmentObj)
        .then(res => { this.showAlert('Assignment created successfully..'); this.nav.setRoot(WelcomePage) })
        .catch(err => this.showAlert(err))
    }
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
