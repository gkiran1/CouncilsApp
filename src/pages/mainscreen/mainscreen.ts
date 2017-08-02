import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { CreateAccountPage } from '../create-account/create-account';
import { ForgotPwd } from '../forgotpwd/forgotpwd';
import { LoginPage } from '../login/login'

@Component({
    selector: 'page-mainscreen',
    templateUrl: 'mainscreen.html',
})

export class MainScreenPage {

    constructor(public nav: NavController) {
        // localStorage.setItem('Firsttimeinstall', 'true');
    }

    public Login() {
        this.nav.push(LoginPage);
    }

    noAccount() {
        this.nav.push(CreateAccountPage);
    }

}



