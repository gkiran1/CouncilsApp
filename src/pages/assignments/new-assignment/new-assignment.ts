import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { AlertController, ActionSheetController, MenuController, NavController, NavParams, ModalController, ToastController } from 'ionic-angular';
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
  dateErr = false;
  assignment;
  invalidUser = false;
  isAssigntoTouched = false;
  isValidDesc = true;

  constructor(public modalCtrl: ModalController, public menuctrl: MenuController, public actionSheetCtrl: ActionSheetController, public af: AngularFire, navParams: NavParams, fb: FormBuilder, public firebaseservice: FirebaseService, public alertCtrl: AlertController, public nav: NavController, public toast: ToastController) {
    let assignment = navParams.get('assignment');
    let description = navParams.get('item');
    this.uid = localStorage.getItem('securityToken');
    this.usercouncils = localStorage.getItem('userCouncils').split(',');
    this.assignment = assignment;
    if (assignment) {
      this.isNewAssignment = false;
      this.isPersonalAssignment = assignment.assignedto === this.uid;
      this.assignmentKey = assignment.$key;
      let localdate = new Date(assignment.assigneddate).toLocaleString("en-US", { timeZone: "UTC" });
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
        createddate: new Date().toISOString(),
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
          this.assignment.createdusername = this.user.firstname + ' ' + this.user.lastname;
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
          if (u[0] && u[0].isactive) {
            this.firebaseservice.checkNetworkStatus(u[0].$key, function (status) {
              u[0].status = status ? '#3cb18a' : '#a9aaac';
            });
            this.users.push(u[0]);
          }
        });
      });
    });
  }
  cancel() {
    if (this.isNewAssignment) {
      this.nav.pop({ animate: true, animation: 'transition', direction: 'back' });
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
      assignedusername: value.assigneduser,
      completedby: value.completedby,
      createdusername: this.user.firstname + ' ' + this.user.lastname,
    }
  }
  onChange($event) {
    var newDate = new Date($event.year.value, $event.month.value - 1, $event.day.value, $event.hour.value, $event.minute.value);
    //alert(newDate);
    if (moment(newDate).isBefore(moment().set({ second: 0 }))) {
      this.dateErr = true;
    }
    else {
      this.dateErr = false;
    }
  }
  createAssignment(value) {
    this.dateErr = false;
    if (!this.assigneduser || (this.assigneduser.firstname + ' ' + this.assigneduser.lastname) !== value.assigneduser) {
      //this.showAlert('Invalid user');
      this.invalidUser = true;
      return;
    }
    value.completedby = '';
    let formattedAssignmentObj = this.formatAssignmentObj(value);
    if (moment(formattedAssignmentObj.assigneddate).isBefore(moment().set({ second: 0 }))) {
      this.dateErr = true;
      // this.showAlert('Invalid date');
    } else {

      this.firebaseservice.createAssigment(formattedAssignmentObj)
        .then(key => {
          this.createActivity(key, 'created');
          this.nav.setRoot(AssignmentsListPage);
        })
        .catch(err => this.showAlert('Connection error.'))
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

  complete(value) {
    if (value.isCompleted) {
      this.showAlert('This assignment is already completed');
    } else if ((this.assigneduser.firstname + ' ' + this.assigneduser.lastname) !== value.assigneduser) {
      //this.showAlert('Invalid user');
      this.invalidUser = true;
    } else {
      value.completedby = this.user.firstname + " " + this.user.lastname;
      value.isCompleted = true;
      let formattedAssignmentObj = this.formatAssignmentObj(value);
      this.firebaseservice.updateAssignment(formattedAssignmentObj, this.assignmentKey)
        .then(res => {
          // this.createActivity(this.assignmentKey, 'completed');
          this.nav.pop();
        })
        .catch(err => { this.showAlert('Connection error.') })
    }
  }
  edit(value) {
    this.isAssigntoTouched = false;
    if ((this.assigneduser.firstname + ' ' + this.assigneduser.lastname) !== value.assigneduser) {
      //this.showAlert('Invalid user');
      this.invalidUser = true;
      return;
    }
    value.completedby = '';
    let formattedAssignmentObj = this.formatAssignmentObj(value);
    this.firebaseservice.updateAssignment(formattedAssignmentObj, this.assignmentKey)
      .then(res => {
        this.nav.popToRoot();
        this.createActivity(this.assignmentKey, 'updated');
      })
      .catch(err => { this.showAlert('Connection error.') })
  }
  delete() {
    this.firebaseservice.removeAssignment(this.assignmentKey, this.assignment)
      .then(res => {

        // this.firebaseservice.removeActivities(this.assignmentKey);

        // this.createActivity(this.assignmentKey, 'deleted');
        this.nav.pop();
      })
      .catch(err => { this.showAlert('Connection error.') })
  }

  showConfirm() {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Confirm delete',
          cssClass: "actionsheet-items",
          handler: () => {
            this.menuctrl.close();
            this.delete();

            // .catch(err => { this.showAlert('Connection error.') });
          }
        },
        {
          text: 'Cancel',
          cssClass: "actionsheet-cancel",
          handler: () => {
          }
        }
      ]
    });
    actionSheet.present();
  }

  showList(event) {
    this.invalidUser = false;
    let v = event.target.value;
    if (v.charAt('0') !== '@') {
      event.target.value = '@' + event.target.value;
      (<FormControl>this.assignmentForm.controls['assigneduser']).setValue(event.target.value);
      // this.showlist = false; return;
    }
    this.term = v.substr(1);
    this.showlist = true;
  }

  hideList() {
    let assignmedusername = this.assigneduser && (this.assigneduser.firstname + ' ' + this.assigneduser.lastname);
    let userinputname = '' + (<FormControl>this.assignmentForm.get('assigneduser').value);
    this.showlist = false;
    if ((assignmedusername === userinputname)) {
      return;
    } else if (('@' + assignmedusername === userinputname)) {
      (<FormControl>this.assignmentForm.controls['assigneduser']).setValue(assignmedusername);
      return;
    }
    (<FormControl>this.assignmentForm.controls['assigneduser']).setValue('');

  }
  bindAssignto(user) {
    this.isAssigntoTouched = true;
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
      entityDescription: this.assignmentForm.value.description,
      action: action,
      councilid: this.assignedcouncil.$key,
      councilname: this.assignedcouncil.council,
      timestamp: new Date().toISOString(),
      createdUserId: this.user.$key,
      createdUserName: this.user.firstname + ' ' + this.user.lastname,
      createdUserAvatar: this.user.avatar,
      nodename: 'assignments'
    }
    this.firebaseservice.createActivity1(activity);
  }

  keypressed($event) {
    $event.target.value.trim() === '' ? this.isValidDesc = false : this.isValidDesc = true;
  }


}
