import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { InactivateMembersPage } from '../inactivatemembers/inactivate-members/inactivatemembers.component';
import { ReactivateMembersPage } from '../reactivatemembers/reactivate-members/reactivatemembers.component';
import { TransferAdminRightsPage } from '../transferadminrights/transfer-adminrights/transferadminrights.component';
import { InviteMemberPage } from '../invite/invite';
import { ActiveCouncilsPage } from '../activecouncils/activecouncils';
import { NewCouncilPage } from '../new-council/new-council';
import { WelcomePage } from '../menu/menu';

@Component({
    selector: 'admin-page',
    templateUrl: 'admin.html'
})

export class AdminPage {

    constructor(private navCtrl: NavController) { }

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

    getInactiveUsers() {
        this.navCtrl.push(ReactivateMembersPage);
    }

    transferAdminRights() {
        this.navCtrl.push(TransferAdminRightsPage);
    }

    back() {
        this.navCtrl.setRoot(WelcomePage);
    }

}