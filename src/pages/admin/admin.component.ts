import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { InactivateMembersPage } from '../inactivatemembers/inactivate-members/inactivatemembers.component';
import { ReactivateMembersPage } from '../reactivatemembers/reactivate-members/reactivatemembers.component';
import { TransferAdminRightsPage } from '../transferadminrights/transfer-adminrights/transferadminrights.component';

@Component({
    selector: 'admin-page',
    templateUrl: 'admin.html'
})

export class AdminPage {

    constructor(private navCtrl: NavController) { }

    getActiveUsers() {
        this.navCtrl.push(InactivateMembersPage);
    }

    getInactiveUsers() {
        this.navCtrl.push(ReactivateMembersPage);
    }

    transferAdminRights() {
        this.navCtrl.push(TransferAdminRightsPage);
    }
}