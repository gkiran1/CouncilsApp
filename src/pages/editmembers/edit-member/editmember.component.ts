import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { User } from '../../../user/user';
import { AlertController, NavController, NavParams, ActionSheetController, MenuController } from 'ionic-angular';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';

@Component({
    templateUrl: 'editmember.html',
    selector: 'editmember-page'
})

export class EditMemberPage {

    selectedUser: any;
    selectedUserCouncils = [];
    adminCouncils = [];
    councilsObj = [];
    isCouncilsChanged = false;

    constructor(public navParams: NavParams,
        public navCtrl: NavController,
        private firebaseService: FirebaseService) {
        this.adminCouncils = localStorage.getItem('userCouncils').split(',');
        this.selectedUser = navParams.get('selectedUser');
        this.selectedUserCouncils = this.selectedUser.councils;

        this.adminCouncils.forEach(counId => {
            var isMemberCncl = false;
            this.firebaseService.getCouncilByKey(counId).subscribe((councilObj) => {
                if (this.selectedUserCouncils.indexOf(counId) !== -1) {
                    isMemberCncl = true;
                }
                this.councilsObj.push({
                    councilName: councilObj[0].council,
                    isMemberCouncil: isMemberCncl,
                    councilId: counId
                });
            });
        });
    }

    enableSaveBtn() {
        this.isCouncilsChanged = true;
    }

    updateCouncils() {
        var updatedCouncils = [];
        this.councilsObj.forEach(obj => {
            if (obj.isMemberCouncil) {
                updatedCouncils.push(obj.councilId);
            }
        });
        this.firebaseService.updateCouncilsInUser(this.selectedUser.$key, updatedCouncils).then((res) => {
            this.firebaseService.deleteCouncilsInUserCouncils(this.selectedUser.$key).then((res) => {
                if (res) {
                    updatedCouncils.forEach(id => {
                        this.firebaseService.createUserCouncils(this.selectedUser.$key, id);
                    });
                }
            });
        });
    }

    back() {
        this.navCtrl.pop();
    }
}