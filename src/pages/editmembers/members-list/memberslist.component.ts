import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { User } from '../../../user/user';
import { AlertController, NavController, ActionSheetController, MenuController } from 'ionic-angular';
import { AngularFire } from 'angularfire2';
import { EditMemberPage } from '../edit-member/editmember.component';

@Component({
    templateUrl: 'memberslist.html',
    selector: 'memberslist-page'
})

export class MembersListPage {

    users: User[] = [];

    constructor(private firebaseService: FirebaseService,
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

    editMember(user) {
        this.nav.push(EditMemberPage, { selectedUser: user }, { animate: true, animation: 'transition', direction: 'forward' });
    }

    back() {
        this.nav.pop({ animate: true, animation: 'transition', direction: 'back' });

    }
}