import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { NavController, NavParams } from 'ionic-angular';
import { EditCompletePage } from '../edit-complete/editcomplete.component';

@Component({
    templateUrl: 'editmember.html',
    selector: 'editmember-page'
})

export class EditMemberPage {

    selectedUser: any;
    selectedUserCouncils = [];
    adminCouncils = [];
    councilsObj = [];
    enableBtn = false;

    constructor(public navParams: NavParams,
        public navCtrl: NavController,
        private firebaseService: FirebaseService) {
        this.adminCouncils = localStorage.getItem('userCouncils').split(',');
        this.selectedUser = navParams.get('selectedUser');
        this.selectedUserCouncils = this.selectedUser.councils;
        this.enableBtn = false;

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
        this.enableBtn = false;
        this.councilsObj.forEach(obj => {
            if (obj.isMemberCouncil) {
                this.enableBtn = true;
                return;
            }
        });
    }

    updateCouncils() {
        this.enableBtn = false;
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
            }).then(() => {
                this.firebaseService.getAssignmentsByUserKey(this.selectedUser.$key).subscribe(assignments => {
                    assignments.forEach(assignment => {
                        if (updatedCouncils.indexOf(assignment.councilid) === -1) {
                            // Remove assignment in assignments since user is not in that council now..
                            this.firebaseService.removeAssignment(assignment.$key)
                        }
                    });
                });
            }).then(() => {
                this.firebaseService.getAgendas().subscribe(agendas => {
                    agendas.forEach(agenda => {
                        if (updatedCouncils.indexOf(agenda.councilid) === -1) {
                            // Update agendas since user is not in that council now..
                            if (agenda.openingprayeruserid === this.selectedUser.$key) {
                                this.firebaseService.updateOpeningPrayerInAgendas(agenda.$key);
                            }
                            if (agenda.spiritualthoughtuserid === this.selectedUser.$key) {
                                this.firebaseService.updateSpiritualThoughtInAgendas(agenda.$key);
                            }
                            if (agenda.closingprayeruserid === this.selectedUser.$key) {
                                this.firebaseService.updateClosingPrayerInAgendas(agenda.$key);
                            }
                        }
                    });
                });

            }).then(() => {
                this.navCtrl.push(EditCompletePage, { name: this.selectedUser.firstname + ' ' + this.selectedUser.lastname });
            });
        });
    }

    back() {
        this.navCtrl.pop({ animate: true, animation: 'transition', direction: 'back' });

    }
}