import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { User } from '../../../user/user';
import { AlertController, NavController, ActionSheetController, MenuController } from 'ionic-angular';

@Component({
    templateUrl: 'transferadminrights.html',
    selector: 'transferadminrights-page'
})

export class TransferAdminRightsPage {
    users: User[] = [];
    userKeys = [];
    currentAdminId: string;

    constructor(public appService: AppService,
        private firebaseService: FirebaseService,
        private nav: NavController,
        private alertCtrl: AlertController,
        public actionSheetCtrl: ActionSheetController,
        public menuctrl: MenuController) {
        this.appService.getUser().subscribe(usr => {
            this.currentAdminId = usr.$key;
            this.firebaseService.getUsersByUnitNumber(usr.unitnumber).subscribe(usersObj => {
                this.users = [];
                usersObj.forEach(userObj => {
                    if (userObj.$key !== usr.$key && userObj.isactive === true) {
                        var userCouncilNames: string[] = [];
                        userObj.councils.forEach(councilId => {
                            this.firebaseService.getCouncilByKey(councilId).subscribe((councilObj) => {
                                userCouncilNames.push(councilObj[0].council);
                                userObj.councilnames = userCouncilNames.join(', ');
                            });
                        });
                        this.users.push(userObj);
                    }
                });
            });
        });
    }

    transferAdminRights(user) {
        this.firebaseService.transferAdminRights(this.currentAdminId, user.$key)
            .then(() => {
                //this.nav.push(MemberReactivatedPage);
            })
            .catch(err => { this.showAlert('Unable to reactivate the member, please try after some time') });
    }

    showAlert(errText) {
        let alert = this.alertCtrl.create({
            title: '',
            subTitle: errText,
            buttons: ['OK']
        });
        alert.present();
    }

    cancel() {
        this.nav.pop();
    }

}