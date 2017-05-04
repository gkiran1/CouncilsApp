import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { AlertController, NavController, NavParams, ModalController } from 'ionic-angular';
import { MenuPage } from '../../menu/menu';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFire } from 'angularfire2';
import { CouncilUsersModalPage } from '../../../modals/council-users/council-users';
import { UserCouncilsModalPage } from '../../../modals/user-councils/user-councils';
import { AssignmentsListPage } from '../assignments-list/assignments-list';

@Component({
  templateUrl: 'new-assignment.html',
  selector: 'new-assignment-page'
})
export class NewAssignmentPage {
  minDate = moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');
  users = [];
  councils = [];
  assignmentForm: FormGroup;
  usercouncils = [];
  isNewAssignment = true;
  assignmentKey = '';
  uid;
  assignedcouncil;
  assigneduser;
  councilusersModal;
  isModalDismissed = true;
  showlist = false;
  term;
  isPersonalAssignment;
  user;

  constructor(public modalCtrl: ModalController, public af: AngularFire, navParams: NavParams, fb: FormBuilder, public firebaseservice: FirebaseService, public alertCtrl: AlertController, public nav: NavController) {
    let assignment = navParams.get('assignment');
    let description = navParams.get('item');
    this.uid = localStorage.getItem('securityToken');
    this.usercouncils = localStorage.getItem('userCouncils').split(',');

    if (assignment) {
      this.isNewAssignment = false;
      this.isPersonalAssignment = assignment.assignedto === this.uid;
      this.assignmentKey = assignment.$key;
      let localdate = new Date(assignment.assigneddate).toLocaleString();
      let localISOformat = this.localISOformat(localdate);
      this.assignmentForm = fb.group({
        description: [assignment.description, Validators.required],
        assigneduser: ['', Validators.required],
        assignedcouncil: ['', Validators.required],
        assigneddate: [localISOformat, Validators.required],
        createdby: assignment.createdby,
        createddate: assignment.createddate,
        isactive: assignment.isactive, //default false
        lastupdateddate: assignment.lastupdateddate,
        notes: assignment.notes,
        isCompleted: assignment.isCompleted
      });
    } else {
      // var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      // var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
      let date = this.localISOformat(new Date());
      this.assignmentForm = fb.group({
        description: [description ? description : '', Validators.required],
        assigneduser: ['', Validators.required],
        assignedcouncil: ['', Validators.required],
        assigneddate: [date, Validators.required],
        createdby: '',
        createddate: '',
        isactive: true, //default true
        lastupdateddate: '',
        notes: '',
        isCompleted: false
      });
    }
    this.af.auth.subscribe(auth => {
      if (!auth) return;
      this.af.database.object('/users/' + auth.uid).subscribe(user => {
        this.user = user;
        user.councils.forEach(c => {
          this.firebaseservice.getCouncilByCouncilKey(c).subscribe(council => {
            this.councils.push(council);
          });
        });

        if (assignment) {
          firebaseservice.getCouncilByCouncilKey(assignment.councilid).subscribe(council => {
            this.updateUsers(council.$key);
            setTimeout(() => {
              (<FormControl>this.assignmentForm.controls['assignedcouncil']).setValue(council.council);
              this.assignedcouncil = council;
            });
          });
          firebaseservice.getUsersByKey(assignment.assignedto).subscribe(u => {
            (<FormControl>this.assignmentForm.controls['assigneduser']).setValue(u[0].firstname + ' ' + u[0].lastname);
            this.assigneduser = u[0];
          });
        } else {
          (<FormControl>this.assignmentForm.controls['createdby']).setValue(user.$key);
        }

      });
    });
  }

  ngOnInit() {
    if (!this.assignmentForm.value.isactive) {
      this.showAlert('This is a deleted assignment!');
    }
  }
  showCouncilsModal(event, value) {
    event.preventDefault();
    let usercouncilsmodal = this.modalCtrl.create(UserCouncilsModalPage, { fromPage: 'assignment', usercouncils: this.usercouncils, selectedCouncil: this.assignedcouncil });
    usercouncilsmodal.present();
    usercouncilsmodal.onDidDismiss(council => {
      if (!council) return;
      (<FormControl>this.assignmentForm.controls['assigneduser']).setValue('');
      this.showlist = false;
      this.updateUsers(council.$key);
      (<FormControl>this.assignmentForm.controls['assignedcouncil']).setValue(council.council);
      this.assignedcouncil = council;
    });
  }
  updateUsers(councilid) {
    this.firebaseservice.getUsersByCouncil(councilid).subscribe(uc => {
      this.users = [];
      uc.forEach(e => {
        this.firebaseservice.getUsersByKey(e.userid).subscribe(u => {
          this.firebaseservice.checkNetworkStatus(u[0].$key, function (status) {
            console.log('status', status);
            u[0].status = status ? 'green' : 'gray';
          });
          this.users.push(u[0]);
        });
      });
    });
  }
  cancel() {
    if (this.isNewAssignment) {
      this.nav.popToRoot();
    } else {
      this.nav.pop({ animate: true, animation: 'transition', direction: 'back' });
    }

  }

  formatAssignmentObj(value) {

    //input time is in local ISO format. hence manually converting it GMT ISO format. 
    let assigneddate = value.assigneddate.replace(/T/, ' ').replace(/Z/, '');
    return {
      assigneddate: moment(assigneddate).toISOString(),
      createddate: value.createddate,
      lastupdateddate: new Date().toISOString(),
      createdby: value.createdby,
      description: value.description,
      assigneduser: this.assigneduser.$key,
      councilid: this.assignedcouncil.$key,
      councilname: this.assignedcouncil.council,
      isactive: value.isactive,
      notes: value.notes,
      isCompleted: value.isCompleted,
      assignedusername: value.assigneduser
    }
  }

  createAssignment(value) {
    if (!this.assigneduser || (this.assigneduser.firstname + ' ' + this.assigneduser.lastname) !== value.assigneduser) {
      this.showAlert('Please assign to a valid user');
      return;
    }
    let formattedAssignmentObj = this.formatAssignmentObj(value);
    if (moment(formattedAssignmentObj.assigneddate).isBefore(moment().set({ second: 0 }))) {
      this.showAlert('Assignment Date/Time cannot be in past');
    } else {

      this.firebaseservice.createAssigment(formattedAssignmentObj)
        .then(key => {
          this.createActivity(key, 'created');
          this.nav.popToRoot();
        })
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
    } else if ((this.assigneduser.firstname + ' ' + this.assigneduser.lastname) !== value.assigneduser) {
      this.showAlert('Please assign to a valid user');
    } else {
      value.isCompleted = true;
      let formattedAssignmentObj = this.formatAssignmentObj(value);
      this.firebaseservice.updateAssignment(formattedAssignmentObj, this.assignmentKey)
        .then(res => {
          console.log(res);
          this.createActivity(this.assignmentKey, 'completed');
          this.nav.pop();
        })
        .catch(err => { console.error(err); this.showAlert('Unable to updated the Assignment, please try after some time') })
    }
  }
  edit(value) {
    if ((this.assigneduser.firstname + ' ' + this.assigneduser.lastname) !== value.assigneduser) {
      this.showAlert('Please assign to a valid user');
      return;
    }
    let formattedAssignmentObj = this.formatAssignmentObj(value);
    this.firebaseservice.updateAssignment(formattedAssignmentObj, this.assignmentKey)
      .then(res => {
        this.nav.popToRoot();
        console.log(res);
        this.createActivity(this.assignmentKey, 'updated');
      })
      .catch(err => { console.error(err); this.showAlert('Unable to updated the Assignment, please try after some time') })
  }
  delete() {
    this.firebaseservice.removeAssignment(this.assignmentKey)
      .then(res => {
        console.log(res);
        this.createActivity(this.assignmentKey, 'deleted');
        this.nav.pop();
      })
      .catch(err => { console.error(err); this.showAlert('Unable to delete the Assignment, please try after some time') })
  }

  showConfirm() {
    let confirm = this.alertCtrl.create({
      title: 'Are you sure you want to delete?',
      // message: 'Do you agree to use this lightsaber to do good across the intergalactic galaxy?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.delete();
          }
        },
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        }
      ]
    });
    confirm.present();
  }

  showList(event) {
    let v = event.target.value;
    if (v.charAt('0') !== '@') {
      event.target.value = '@' + event.target.value;
      (<FormControl>this.assignmentForm.controls['assigneduser']).setValue(event.target.value);
      // this.showlist = false; return;
    }
    this.term = v.substr(1);
    this.showlist = true;
  }
  bindAssignto(user) {
    this.showlist = false;
    (<FormControl>this.assignmentForm.controls['assigneduser']).setValue(user.firstname + ' ' + user.lastname);
    this.assigneduser = user;
  }

  pad(number) {
    if (number < 10) {
      return '0' + number;
    }
    return number;
  }

  localISOformat(date) {
    date = new Date(date);
    return date.getFullYear() +
      '-' + this.pad(date.getMonth() + 1) +
      '-' + this.pad(date.getDate()) +
      'T' + this.pad(date.getHours()) +
      ':' + this.pad(date.getMinutes()) +
      ':' + this.pad(date.getSeconds()) +
      '.' + (date.getMilliseconds() / 1000).toFixed(3).slice(2, 5) +
      'Z';
  };

  createActivity(assignmentKey, action) {
    let activity = {
      userid: this.assigneduser.$key,
      entity: 'Assignment',
      entityid: assignmentKey,
      action: action,
      timestamp: new Date().toISOString(),
      createdUserId: this.user.$key,
      createdUserName: this.user.firstname + ' ' + this.user.lastname,
      createdUserAvatar: this.user.avatar
    }
    this.firebaseservice.createActivity(activity);
  }

}
