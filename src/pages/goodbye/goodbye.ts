import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { LoginPage } from '../login/login';

@Component({
    selector: 'page-goodbye',
    templateUrl: 'goodbye.html'
})

export class GoodbyePage {

    constructor(public navCtrl: NavController, public navParams: NavParams) { }

    logIn() {
        this.navCtrl.setRoot(LoginPage);
    }

}
