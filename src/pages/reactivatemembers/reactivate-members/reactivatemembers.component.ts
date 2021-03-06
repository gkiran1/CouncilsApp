import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { User } from '../../../user/user';
import { AlertController, NavController, ActionSheetController, MenuController } from 'ionic-angular';
import { MemberReactivatedPage } from '../member-reactivated/memberreactivated.component';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';

@Component({
    templateUrl: 'reactivatemembers.html',
    selector: 'reactivatemembers-page'
})

export class ReactivateMembersPage {
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
                if (userObj.$key !== userUid && userObj.isactive === false) {
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

    reactivatemember(user: User) {
        this.firebaseService.reactivateUser(user.$key, true)
            .then(() => {
                this.nav.push(MemberReactivatedPage);
            })
            .catch(err => { this.showAlert('Unable to reactivate the member, please try after some time') });
    }

    reactivateAll() {
        this.users.forEach((usr) => {
            this.firebaseService.reactivateUser(usr.$key, true)
                .then(() => {
                    console.log('Member reactivated successfully..!!');
                })
                .catch(err => { this.showAlert('Unable to reactivate the member, please try after some time') });
        });

        if (this.users && this.users.length === 0) {
            console.log(this.users);
            this.showAlert('All the members are reactivated successfully..!!!');
            this.nav.pop();
        }
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