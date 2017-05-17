import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { InactivateMembersPage } from '../inactivatemembers/inactivate-members/inactivatemembers.component';
import { ReactivateMembersPage } from '../reactivatemembers/reactivate-members/reactivatemembers.component';
import { TransferAdminRightsPage } from '../transferadminrights/transfer-adminrights/transferadminrights.component';
import { InviteMemberPage } from '../invite/invite';
import { ActiveCouncilsPage } from '../activecouncils/activecouncils';
import { NewCouncilPage } from '../new-council/new-council';
import { MembersListPage } from '../editmembers/members-list/memberslist.component';
import { NotificationsPage } from '../notifications/notifications-page/notifications.component';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { NewMenuPage } from '../newmenu/newmenu';

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
        this.navCtrl.push(ActiveCouncilsPage, {}, { animate: true, animation: 'transition', direction: 'forward' });
    }

    createCouncils() {
        this.navCtrl.push(NewCouncilPage, {}, { animate: true, animation: 'transition', direction: 'forward' });
    }

    inviteMembers() {
        this.navCtrl.push(InviteMemberPage, {}, { animate: true, animation: 'transition', direction: 'forward' });
    }

    getActiveUsers() {
        this.navCtrl.push(InactivateMembersPage, {}, { animate: true, animation: 'transition', direction: 'forward' });
    }

    editMembers() {
        this.navCtrl.push(MembersListPage, {}, { animate: true, animation: 'transition', direction: 'forward' });
    }

    getInactiveUsers() {
        this.navCtrl.push(ReactivateMembersPage, {}, { animate: true, animation: 'transition', direction: 'forward' });
    }

    transferAdminRights() {
        this.navCtrl.push(TransferAdminRightsPage, {}, { animate: true, animation: 'transition', direction: 'forward' });
    }

    back() {
        this.navCtrl.pop();
    }

    notificationsPage() {
        this.navCtrl.push(NewMenuPage);
    }

}