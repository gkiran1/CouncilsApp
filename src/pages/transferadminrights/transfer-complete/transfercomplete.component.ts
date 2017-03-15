import { Component } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';
import { WelcomePage } from '../../menu/menu'

@Component({
    selector: 'transfercomplete-page',
    templateUrl: 'transfercomplete.html'
})

export class TransferCompletePage {

    newAdmin: any;

    constructor(public navParams: NavParams, public navCtrl: NavController) {
        this.newAdmin = navParams.get('newAdmin');
    }

    back() {
        this.navCtrl.setRoot(WelcomePage);
    }
}
