import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Observable } from 'rxjs/Observable';
import { WelcomePage } from '../menu/menu';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { AdminPage } from '../admin/admin.component';
import { SettingsPage } from '../settings/settings';

@Component({
    templateUrl: 'slide1.html',
    selector: 'slide1'
})

export class slide1Page {
    isAdmin: boolean = false;
    constructor(public nav: NavController,
        public af: AngularFire) {
        if (localStorage.getItem('isAdmin') === 'true') {
            this.isAdmin = true;
        }
        console.log(this.isAdmin);
    }

    adminPage() {
        this.nav.setRoot(AdminPage);
    }
    settingsPage() {
        this.nav.setRoot(SettingsPage);
    }
}