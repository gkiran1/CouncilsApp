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
    providers: [EmailService]
})

export class TransferAdminRightsPage {
    users: User[] = [];
    currentAdminId: string;
    userSubscription;
    currentUser;

    constructor(public af: AngularFire,
        private firebaseService: FirebaseService,
        private nav: NavController,
        private alertCtrl: AlertController,
        private actionSheetCtrl: ActionSheetController,
        private menuctrl: MenuController,
        public emailservice: EmailService
    ) {

        this.users = [];

        this.userSubscription = this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.af.database.object('/users/' + auth.uid).subscribe(usr => {
                    this.currentUser = usr;
                    this.firebaseService.getUsersByUnitNumber(this.currentUser.unitNumber).subscribe(usersObj => {
                        this.users = usersObj.filter(userObj => {
                            if (userObj.$key !== this.currentUser.$key && userObj.isactive === true) {
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
                });
            }
        });

        // this.currentAdminId = localStorage.getItem('securityToken');
        // const unitNumber = Number(localStorage.getItem('unitNumber'));

    }

    transferAdminRights(user) {
        let actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Confirm Transfer',
                    cssClass: "actionsheet-items",
                    handler: () => {
                        this.menuctrl.close();
                        this.firebaseService.transferAdminRights(this.currentAdminId, user.$key).
                            then(() => {

                                // Updating councils(the new admin has to have all councils of the person who is transfering admin rights).

                                var adminCouncils = localStorage.getItem('userCouncils').split(',');

                                this.firebaseService.updateCouncilsInUser(user.$key, adminCouncils).then(() => {
                                    this.firebaseService.deleteCouncilsInUserCouncils(user.$key).then((res) => {
                                        if (res) {
                                            adminCouncils.forEach(id => {
                                                this.firebaseService.createUserCouncils(user.$key, id);
                                            });
                                        }
                                    });
                                });

                                this.emailservice.emailTrasferAdmin(this.currentUser.firstname,
                                    this.currentUser.lastname,
                                    this.currentUser.unitnumber, user.email, user.firstname, user.lastname).subscribe(res => {
                                        if (res.status === 200) {
                                            console.log('Transferred Admin Rights');
                                        } else {
                                            console.log('Mail not sent for account inactivation');
                                        }
                                    });

                            }).then(() => {
                                localStorage.setItem('isAdmin', 'false');
                                this.nav.push(TransferCompletePage, { newAdmin: user });
                            }).catch(err => { this.showAlert('Unable to transfer admin rights now, please try after some time') });
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