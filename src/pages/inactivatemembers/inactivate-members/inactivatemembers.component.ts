import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { User } from '../../../user/user';
import { AlertController, NavController, ActionSheetController, MenuController, ToastController } from 'ionic-angular';
import { MemberInactivatedPage } from '../member-inactivated/memberinactivated.component';
import { AngularFire } from 'angularfire2';
import { EmailService } from '../../../providers/emailservice';

@Component({
    templateUrl: 'inactivatemembers.html',
    selector: 'inactivatemembers-page',
    providers: [EmailService]
})

export class InactivateMembersPage {
    users: User[] = [];
    adminname;

    constructor(public appService: AppService,
        private firebaseService: FirebaseService,
        private nav: NavController,
        private alertCtrl: AlertController,
        public actionSheetCtrl: ActionSheetController,
        public menuctrl: MenuController, public af: AngularFire,
        public emailservice: EmailService, public toast: ToastController) {

        const userUid = localStorage.getItem('securityToken');
        const unitNumber = Number(localStorage.getItem('unitNumber'));
        this.users = [];

        this.firebaseService.getUsersByKey(userUid).subscribe(user => {
            this.adminname = user[0].firstname + " " + user[0].lastname;
        });

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
                        this.firebaseService.inactivateUser(user.$key, false, user.pushtoken)
                            .then(() => {
                                this.emailservice.emailAccountInactive(user.firstname + " " + user.lastname, user.email, this.adminname).then(res => {
                                    res.subscribe(result => {
                                        if (result.status === 200) {
                                            console.log(result);
                                        } else {
                                        }
                                    });
                                });
                                this.nav.push(MemberInactivatedPage);
                            })
                            .catch(err => { this.showAlert('Connection error.') });
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
        this.nav.pop({ animate: true, animation: 'transition', direction: 'back' });
    }

    showAlert(errText) {
        // let alert = this.alertCtrl.create({
        //     title: '',
        //     subTitle: errText,
        //     buttons: ['OK']
        // });
        // alert.present();

        let toast = this.toast.create({
            message: errText,
            duration: 3000
        })

        toast.present();
    }

}