import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../../menu/menu';

@Component({
    selector: 'transfercomplete-page',
    templateUrl: 'transfercomplete.html'
})

export class TransferCompletePage {

    constructor(public navCtrl: NavController, public navParams: NavParams) { }

    goToHome() {
        this.navCtrl.push(WelcomePage);
    }

}
