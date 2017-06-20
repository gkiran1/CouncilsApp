import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { LoginPage } from '../login/login';

@Component({
    selector: 'page-welcome',
    templateUrl: 'welcome.html'
})

export class WelcomePage {

    constructor(public navCtrl: NavController, public navParams: NavParams) { }

    logIn() {
        this.navCtrl.setRoot(LoginPage);
    }

}
