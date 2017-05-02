import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { InviteMemberPage } from '../../invite/invite';

@Component({
    selector: 'member-inactivated',
    templateUrl: 'memberinactivated.html'
})

export class MemberInactivatedPage {

    constructor(public navCtrl: NavController) { }

    goToInactivateMembersPage() {
        this.navCtrl.pop();
    }
    back() {
        this.navCtrl.pop({ animate: true, animation: 'transition', direction: 'back' });
    }
}
