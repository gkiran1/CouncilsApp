import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { AlertController, NavController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../../menu/menu';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFire } from 'angularfire2';

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
  uid;
  constructor(public af: AngularFire, navParams: NavParams, fb: FormBuilder, public firebaseservice: FirebaseService, public alertCtrl: AlertController, public nav: NavController) {
    let assignment = navParams.get('assignment');
    let description = navParams.get('item');
    this.uid = localStorage.getItem('securityToken');

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
        description: [description ? description : '', Validators.required],
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
    this.af.auth.subscribe(auth => {
      if (!auth) return;
      this.af.database.object('/users/' + auth.uid).subscribe(user => {

        user.councils.forEach(c => {
          this.firebaseservice.getCouncilByCouncilKey(c).subscribe(council => {
            this.councils.push(council);
          });
        });

        if (assignment) {
          firebaseservice.getCouncilByCouncilKey(assignment.councilid).subscribe(council => {
            this.updateUsers(council.$key);
            setTimeout(() => {
              (<FormControl>this.assignmentForm.controls['assignedcouncil']).setValue(council.$key);
            });
          });
          firebaseservice.getUsersByKey(assignment.assignedto).subscribe(u => {
            (<FormControl>this.assignmentForm.controls['assigneduser']).setValue(u[0].$key);
          });
        }

        (<FormControl>this.assignmentForm.controls['createdby']).setValue(user.$key);

      });
    });
  }

  assignedCouncilChanged(value) {
    debugger;
    this.users = [];
    (<FormControl>this.assignmentForm.controls['assigneduser']).setValue('');
    this.updateUsers(value.assignedcouncil);
  }
  updateUsers(councilid) {
    this.firebaseservice.getUsersByCouncil(councilid).subscribe(uc => {
      uc.forEach(e => {
        this.firebaseservice.getUsersByKey(e.userid).subscribe(u => {
          this.users.push(u[0]);
        });

      });
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
    let assignedcouncilname;
    this.firebaseservice.getCouncilByCouncilKey(value.assignedcouncil).take(1).subscribe(council => {
      assignedcouncilname = council.council;
    });
    return {
      assigneddate: moment(value.assigneddate + ' ' + value.assignedtime, "YYYY-MM-DD hh:mmA").toISOString(),
      createddate: new Date().toISOString(),
      lastupdateddate: new Date().toISOString(),
      createdby: value.createdby,
      description: value.description,
      assigneduser: value.assigneduser,
      councilid: value.assignedcouncil,
      councilname: assignedcouncilname,
      isactive: value.isactive,
      notes: value.notes,
      isCompleted: value.isCompleted
    }
  }

  createAssignment(value) {
    let formattedAssignmentObj = this.formatAssignmentObj(value);
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
