import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AlertController, NavController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../welcome/welcome';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  templateUrl: 'new-assignment.html',
  selector: 'new-assignment-page'
})
export class NewAssignmentPage {
  minDate = moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');
  users = [];
  councils = [];
  assignmentForm: FormGroup;
  //This is required to store assingeduser object in UI inorder to fetch related councils.
  usercouncils = [];
  arrayWithUserKeys = [];
  isNewAssignment = true;
  assignmentKey = '';

  constructor(navParams: NavParams, fb: FormBuilder, public appservice: AppService, public firebaseservice: FirebaseService, public alertCtrl: AlertController, public nav: NavController) {
    let assignment = navParams.get('assignment');
    if (assignment) {
      this.isNewAssignment = false;
      this.assignmentKey = assignment.$key;
      this.assignmentForm = fb.group({
        description: [assignment.description, Validators.required],
        assigneduser: ['', Validators.required],
        assignedcouncil: ['', Validators.required],
        assigneddate: [assignment.assigneddate, Validators.required],
        assignedtime: [assignment.assigneddate, Validators.required],
        createdby: assignment.createdby,
        createddate: assignment.createddate,
        isactive: assignment.isactive, //default false
        lastupdateddate: assignment.lastupdateddate,
        notes: assignment.notes,
        isCompleted: assignment.isCompleted
      });
    } else {
      this.assignmentForm = fb.group({
        description: ['', Validators.required],
        assigneduser: ['', Validators.required],
        assignedcouncil: ['', Validators.required],
        assigneddate: [moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'), Validators.required],
        assignedtime: ['', Validators.required],
        createdby: '',
        createddate: '',
        isactive: false, //default false
        lastupdateddate: '',
        notes: '',
        isCompleted: false
      });
    }
    appservice.getUser().subscribe(user => {
      (<FormControl>this.assignmentForm.controls['createdby']).setValue(user.$key);

      let subscribe = this.firebaseservice.getUsersByUnitNumber(user.unitnumber).subscribe(users => {
        this.users = users;
        if (assignment) {
          firebaseservice.findUserByKey(assignment.assignedto).subscribe(u => {
            this.users.forEach(e => {
              if (e.$key == u.$key) {
                (<FormControl>this.assignmentForm.controls['assigneduser']).setValue(e);
                this.updateCouncils(e);
                firebaseservice.getCouncilByKey(assignment.councilid).subscribe(council => {
                  this.councils.forEach(c => {
                    //use council[0] to get council since its return type is FirebaseListObservable and just contains one council object. 
                    if (c.$key == council[0].$key) {
                      (<FormControl>this.assignmentForm.controls['assignedcouncil']).setValue(c);
                    }
                  });
                });
              }
            });
          });
        }
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
    });
  }
  assignedMemberChange(value) {
    this.councils = [];
    (<FormControl>this.assignmentForm.controls['assignedcouncil']).setValue('');
    this.updateCouncils(value.assigneduser);
    console.log('member changed::', value);
  }
  updateCouncils(userObj) {
    userObj.councils.forEach(key => {
      this.firebaseservice.getCouncilByKey(key).subscribe(council => this.councils.push(...council));
    });
  }

  cancel() {
    if (this.isNewAssignment) {
      this.nav.setRoot(WelcomePage);
    } else {
      this.nav.pop();
    }

  }

  formatAssignmentObj(value) {
    return {
      assigneddate: moment(value.assigneddate + ' ' + value.assignedtime, "YYYY-MM-DD hh:mmA").toISOString(),
      createddate: new Date().toISOString(),
      lastupdateddate: new Date().toISOString(),
      createdby: value.createdby,
      description: value.description,
      assigneduser: value.assigneduser.$key,
      councilid: value.assignedcouncil.$key,
      councilname: value.assignedcouncil.council,
      isactive: value.isactive,
      notes: value.notes,
      isCompleted: value.isCompleted
    }
  }

  createAssignment(value) {
    console.log('======================>assignmentForm.value', value);
    let formattedAssignmentObj = this.formatAssignmentObj(value);
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

  complete(value) {
    if (value.isCompleted) {
      this.showAlert('This assignment is already completed');
    } else {
      value.isCompleted = true;
      let formattedAssignmentObj = this.formatAssignmentObj(value);
      this.firebaseservice.updateAssignment(formattedAssignmentObj, this.assignmentKey)
        .then(res => { console.log(res); this.showAlert('Assignment marked as completed!'); this.nav.pop(); })
        .catch(err => { console.error(err); this.showAlert('Unable to updated the Assignment, please try after some time') })
    }
  }
  edit(value) {
    let formattedAssignmentObj = this.formatAssignmentObj(value);
    this.firebaseservice.updateAssignment(formattedAssignmentObj, this.assignmentKey)
      .then(res => { console.log(res); this.showAlert('Assignment has been updated') })
      .catch(err => { console.error(err); this.showAlert('Unable to updated the Assignment, please try after some time') })
  }
  delete() {
    this.firebaseservice.removeAssignment(this.assignmentKey)
      .then(res => { console.log(res); this.showAlert('Assignment has been deleted'); this.nav.pop(); })
      .catch(err => { console.error(err); this.showAlert('Unable to delete the Assignment, please try after some time') })
  }

}
