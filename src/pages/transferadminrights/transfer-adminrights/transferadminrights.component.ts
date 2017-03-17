import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { User } from '../../../user/user';
import { AlertController, NavController, ActionSheetController, MenuController } from 'ionic-angular';
import { TransferCompletePage } from '../transfer-complete/transfercomplete.component';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';

@Component({
    templateUrl: 'transferadminrights.html',
    selector: 'transferadminrights-page'
})

export class TransferAdminRightsPage {
    users: User[] = [];
    currentAdminId: string;

    constructor(public af: AngularFire,
        private firebaseService: FirebaseService,
        private nav: NavController,
        private alertCtrl: AlertController,
        private actionSheetCtrl: ActionSheetController,
        private menuctrl: MenuController
    ) {

        this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.firebaseService.findUserByKey(auth.uid).subscribe(usr => {
                    this.currentAdminId = usr.$key;
                    this.firebaseService.getUsersByUnitNumber(usr.unitnumber).subscribe(usrs => {
                        this.users = [];
                        usrs.forEach(usrObj => {
                            if (usrObj.$key !== this.currentAdminId && usrObj.isactive === true) {
                                var userCouncilNames: string[] = [];
                                usrObj.councils.forEach(councilId => {
                                    this.firebaseService.getCouncilByKey(councilId).subscribe((councilObj) => {
                                        userCouncilNames.push(councilObj[0].council);
                                        usrObj.councilnames = userCouncilNames.join(', ');
                                    });
                                });
                                this.users.push(usrObj);
                            }
                        })
                    })
                })
            }
        })
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