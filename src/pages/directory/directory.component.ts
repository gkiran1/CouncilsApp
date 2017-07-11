import { Component } from '@angular/core';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { User } from '../../user/user';
import { AlertController, NavController, ActionSheetController, MenuController } from 'ionic-angular';
import { AngularFire } from 'angularfire2';

@Component({
    templateUrl: 'directory.html',
    selector: 'directory-page'
})

export class DirectoryPage {

    users: User[] = [];
    councils = [];
    term: string = '';

    constructor(private firebaseService: FirebaseService,
        private nav: NavController,
        private alertCtrl: AlertController,
        public actionSheetCtrl: ActionSheetController,
        public menuctrl: MenuController, public af: AngularFire) {

        const userUid = localStorage.getItem('securityToken');
        const unitNumber = Number(localStorage.getItem('unitNumber'));
        this.councils = localStorage.getItem('userCouncils').split(',');
        this.users = [];


        if (localStorage.getItem('isAdmin') === 'true') {
            this.firebaseService.getUsersByUnitNumber(unitNumber).subscribe(usersObj => {
                this.users = [];
                usersObj.forEach(userObj => {
                    this.firebaseService.checkNetworkStatus(userObj.$key, function (status) {
                        userObj.status = status ? '#3cb18a' : '#a9aaac';
                    });
                    this.users.push(userObj);
                });
            });
        }
        else {
            var userKeys = [];

            this.councils.forEach(councilId => {
                this.getUsersByCouncilId(councilId).subscribe(councilUsers => {
                    councilUsers.forEach(councilUser => {
                        this.firebaseService.getUsersByKey(councilUser.userid).subscribe(usrs => {
                            userKeys.push(usrs[0].$key);
                            if (userKeys.indexOf(usrs[0].$key) === userKeys.lastIndexOf(usrs[0].$key)) {
                                this.firebaseService.checkNetworkStatus(usrs[0].$key, function (status) {
                                    usrs[0].status = status ? '#3cb18a' : '#a9aaac';
                                });
                                this.users.push(usrs[0]);
                            }
                        });
                    });
                });
            });
        }
    }

    getUsersByCouncilId(councilId: string) {
        return this.firebaseService.getUsersByCouncil(councilId);
    }

    searchFn(event) {
        this.term = event.target.value;
    }

    cancel() {
        this.nav.popToRoot();
    }
}