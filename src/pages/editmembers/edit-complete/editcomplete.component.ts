import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { MembersListPage } from '../members-list/memberslist.component';


@Component({
    selector: 'editcomplete-page',
    templateUrl: 'editcomplete.html'
})

export class EditCompletePage {
    name;

    constructor(public navCtrl: NavController, public navParams: NavParams) {
        this.name = navParams.get('name');
    }

    goToMembersListPage() {
        this.navCtrl.setRoot(MembersListPage);
    }

    back() {
        this.navCtrl.pop();
    }

}
