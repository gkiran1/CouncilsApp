import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { User } from '../../user/user';
import { AlertController, NavController, ActionSheetController, MenuController } from 'ionic-angular';


@Component({
    templateUrl: 'inactivatemembers.html',
    selector: 'inactivatemembers-page'
})

export class InactivateMembersPage {
    users: User[] = [];
    userKeys = [];

    constructor(public appService: AppService,
        private firebaseService: FirebaseService,
        private nav: NavController,
        private alertCtrl: AlertController,
        public actionSheetCtrl: ActionSheetController,
        public menuctrl: MenuController) {
        this.appService.getUser().subscribe(usr => {
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

    inactivatemember(user: User, index: any) {
        console.log('index', index);
        let actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Confirm Inactivation',
                    cssClass: "actionsheet-items",
                    handler: () => {
                        this.menuctrl.close();
                        this.firebaseService.updateIsactiveInUser(user.$key, false)
                            .then(() => {
                                this.showAlert('member has been inactivated');
                                this.users.splice(index, 1)
                            })
                            .catch(err => { this.showAlert('Unable to inactivate the member, please try after some time') })
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

    cancel() {
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