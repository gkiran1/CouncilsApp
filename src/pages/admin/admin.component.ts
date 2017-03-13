import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { InactivateMembersPage } from '../inactivatemembers/inactivate-members/inactivatemembers.component';

@Component({
    selector: 'admin-page',
    templateUrl: 'admin.html'
})

export class AdminPage {

    constructor(private navCtrl: NavController) { }

    getCouncilsUsers() {
        this.navCtrl.push(InactivateMembersPage);
    }

}