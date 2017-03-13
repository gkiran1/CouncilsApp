import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
    selector: 'member-reactivated',
    templateUrl: 'memberreactivated.html'
})

export class MemberReactivatedPage {

    constructor(public navCtrl: NavController) { }

    goToReactivateMembersPage() {
        this.navCtrl.pop();
    }

}
