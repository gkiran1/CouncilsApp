import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { User } from '../../../user/user';
import { AlertController, NavController, ActionSheetController, MenuController } from 'ionic-angular';
import { MemberInactivatedPage } from '../member-inactivated/memberinactivated.component';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';

@Component({
    templateUrl: 'inactivatemembers.html',
    selector: 'inactivatemembers-page'
})

export class InactivateMembersPage {
    users: User[] = [];   

    constructor(public appService: AppService,
        private firebaseService: FirebaseService,
        private nav: NavController,
        private alertCtrl: AlertController,
        public actionSheetCtrl: ActionSheetController,
        public menuctrl: MenuController, public af: AngularFire) {

        const userUid = localStorage.getItem('securityToken');
        const unitNumber = Number(localStorage.getItem('unitNumber'));
        this.users = [];

        this.firebaseService.getUsersByUnitNumber(unitNumber).subscribe(usersObj => {
            this.users = usersObj.filter(userObj => {
                if (userObj.$key !== userUid && userObj.isactive === true) {
                    var userCouncilNames: string[] = [];
                    userObj.councils.forEach(councilId => {
                        this.firebaseService.getCouncilByKey(councilId).subscribe((councilObj) => {
                            userCouncilNames.push(councilObj[0].council);
                            userObj.councilnames = userCouncilNames.join(', ');
                        });
                    });
                    return userObj;
                }
            });
        });
    }

    inactivatemember(user: User) {
        let actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Confirm Inactivation',
                    cssClass: "actionsheet-items",
                    handler: () => {
                        this.menuctrl.close();
                        this.firebaseService.inactivateUser(user.$key, false)
                            .then(() => {
                                this.nav.push(MemberInactivatedPage);
                            })
                            .catch(err => { this.showAlert('Unable to inactivate the member, please try after some time') });
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

    back() {
        this.nav.pop();
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