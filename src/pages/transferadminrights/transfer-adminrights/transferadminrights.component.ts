import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { User } from '../../../user/user';
import { AlertController, NavController, ActionSheetController, MenuController } from 'ionic-angular';
import { TransferCompletePage } from '../transfer-complete/transfercomplete.component';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { EmailService } from '../../../providers/emailservice';

@Component({
    templateUrl: 'transferadminrights.html',
    selector: 'transferadminrights-page',
    providers:[EmailService]
})

export class TransferAdminRightsPage {
    users: User[] = [];
    currentAdminId: string;

    constructor(public af: AngularFire,
        private firebaseService: FirebaseService,
        private nav: NavController,
        private alertCtrl: AlertController,
        private actionSheetCtrl: ActionSheetController,
        private menuctrl: MenuController,
        public emailservice: EmailService
    ) {
        this.currentAdminId = localStorage.getItem('securityToken');
        const unitNumber = Number(localStorage.getItem('unitNumber'));
        this.users = [];

        this.firebaseService.getUsersByUnitNumber(unitNumber).subscribe(usersObj => {
            this.users = usersObj.filter(userObj => {
                if (userObj.$key !== this.currentAdminId && userObj.isactive === true) {
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

    transferAdminRights(user) {
        let actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Confirm Transfer',
                    cssClass: "actionsheet-items",
                    handler: () => {
                        this.menuctrl.close();
                        this.firebaseService.transferAdminRights(this.currentAdminId, user.$key)
                            .then(() => {
                                localStorage.setItem('isAdmin', 'false');
                                
                                this.nav.push(TransferCompletePage, { newAdmin: user });
                            })
                            .catch(err => { this.showAlert('Unable to transfer admin rights now, please try after some time') });
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

    showAlert(errText) {
        let alert = this.alertCtrl.create({
            title: '',
            subTitle: errText,
            buttons: ['OK']
        });
        alert.present();
    }

    back() {
        this.nav.pop();
    }

}