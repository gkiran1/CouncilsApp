import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { User } from '../../../user/user';
import { AlertController, NavController, ActionSheetController, MenuController, ToastController } from 'ionic-angular';
import { MemberReactivatedPage } from '../member-reactivated/memberreactivated.component';
import { AngularFire } from 'angularfire2';
import { EmailService } from '../../../providers/emailservice';

@Component({
    templateUrl: 'reactivatemembers.html',
    selector: 'reactivatemembers-page',
    providers: [EmailService]
})

export class ReactivateMembersPage {
    users: User[] = [];
    adminname;

    constructor(public appService: AppService,
        private firebaseService: FirebaseService,
        private nav: NavController,
        private alertCtrl: AlertController,
        public actionSheetCtrl: ActionSheetController,
        public toast: ToastController,
        public menuctrl: MenuController, public af: AngularFire,
        public emailservice: EmailService) {
        const userUid = localStorage.getItem('securityToken');
        const unitNumber = Number(localStorage.getItem('unitNumber'));
        this.users = [];

        this.firebaseService.getUsersByKey(userUid).subscribe(user => {
            this.adminname = user[0].firstname + " " + user[0].lastname;
        });

        this.firebaseService.getUsersByUnitNumber(unitNumber).subscribe(usersObj => {
            this.users = usersObj.filter(userObj => {
                if (userObj.$key !== userUid && userObj.isactive === false) {
                    // var userCouncilNames: string[] = [];
                    // userObj.councils.forEach(councilId => {
                    //     this.firebaseService.getCouncilByKey(councilId).subscribe((councilObj) => {
                    //         userCouncilNames.push(councilObj[0].council);
                    //         userObj.councilnames = userCouncilNames.join(', ');
                    //     });
                    // });

                    this.firebaseService.checkNetworkStatus(userObj.$key, function (status) {
                        userObj.status = status ? '#3cb18a' : '#a9aaac';
                    });
                    return userObj;
                }
            });
            this.users.sort(function (a, b) {
                return (a.status === '#3cb18a' && b.status === '#a9aaac') ? -1 : ((a.status === '#a9aaac' && b.status === '#3cb18a') ? 1 : 0);
            });
        });
    }

    reactivatemember(user: User) {
        this.firebaseService.reactivateUser(user.$key, true, user.pushtoken)
            .then(() => {
                this.emailservice.emailReactivate(user.firstname + " " + user.lastname, user.unitnumber, user.email, this.adminname).then(res => {
                    res.subscribe(result => {
                        if (result.status === 200) {
                            console.log(result);
                        } else {
                        }
                    });
                });
                this.nav.push(MemberReactivatedPage);
            })
            .catch(err => { this.showAlert('Connection error.') });
    }

    reactivateAll() {
        this.users.forEach((usr) => {
            this.firebaseService.reactivateUser(usr.$key, true, usr.pushtoken)
                .then(() => {
                })
                .catch(err => { this.showAlert('Connection error.') });
        });

        if (this.users && this.users.length === 0) {
            this.showAlert('All the members are reactivated successfully..!!!');
            this.nav.pop();
        }
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
            duration: 3000,
            position: 'top'
        })

        toast.present();
    }

}