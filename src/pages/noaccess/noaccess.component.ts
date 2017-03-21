import { Component } from '@angular/core';
import { LoginPage } from '../login/login';
import { NavController } from 'ionic-angular';

@Component({
    selector: 'noaccess-page',
    templateUrl: 'noaccess.html'
})

export class NoAccessPage {

    constructor(public navCtrl: NavController) { }

    backToLogin() {
        this.navCtrl.setRoot(LoginPage);
    }

}
