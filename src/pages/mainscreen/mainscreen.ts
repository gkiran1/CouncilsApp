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

    constructor(
        public nav: NavController,
        // public loadingCtrl: LoadingController,
        // public firebaseService: FirebaseService,
        // public alertCtrl: AlertController,
        // public http: Http,
        // private navParams: NavParams,
        // private zone: NgZone,
        // public toast: ToastController,
        // fb: FormBuilder
    ) {
        localStorage.setItem('Firsttimeinstall', 'true');
    }


    public Login() {
        this.nav.push(LoginPage);
    }

    noAccount() {
        this.nav.push(CreateAccountPage);
    }

}



