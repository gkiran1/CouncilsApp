import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

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
        this.navCtrl.popTo(this.navCtrl.getByIndex(1));;
    }

    back() {
        this.navCtrl.pop({ animate: true, animation: 'transition', direction: 'back' });

    }

}
