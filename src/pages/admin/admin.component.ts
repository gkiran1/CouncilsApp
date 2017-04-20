import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { InactivateMembersPage } from '../inactivatemembers/inactivate-members/inactivatemembers.component';
import { ReactivateMembersPage } from '../reactivatemembers/reactivate-members/reactivatemembers.component';
import { TransferAdminRightsPage } from '../transferadminrights/transfer-adminrights/transferadminrights.component';
import { InviteMemberPage } from '../invite/invite';
import { ActiveCouncilsPage } from '../activecouncils/activecouncils';
import { NewCouncilPage } from '../new-council/new-council';
import { WelcomePage } from '../menu/menu';
import { MembersListPage } from '../editmembers/members-list/memberslist.component';
import { NotificationsPage } from '../notifications/notifications-page/notifications.component';
import { FirebaseService } from '../../environments/firebase/firebase-service';

@Component({
    selector: 'admin-page',
    templateUrl: 'admin.html'
})

export class AdminPage {

    notificationsCount;
    constructor(private navCtrl: NavController, public firebaseservice: FirebaseService) {
        firebaseservice.getNotCnt().subscribe(count => {
            this.notificationsCount = count;
        });

    }

    activeCouncils() {
        this.navCtrl.push(ActiveCouncilsPage);
    }

    createCouncils() {
        this.navCtrl.push(NewCouncilPage);
    }

    inviteMembers() {
        this.navCtrl.push(InviteMemberPage);
    }

    getActiveUsers() {
        this.navCtrl.push(InactivateMembersPage);
    }

    editMembers() {
        this.navCtrl.push(MembersListPage);
    }

    getInactiveUsers() {
        this.navCtrl.push(ReactivateMembersPage);
    }

    transferAdminRights() {
        this.navCtrl.push(TransferAdminRightsPage);
    }

    back() {
        this.navCtrl.pop();
    }

    notificationsPage() {
        this.navCtrl.push(NotificationsPage);
    }

}