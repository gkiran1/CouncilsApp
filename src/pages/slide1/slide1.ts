import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MenuPage } from '../menu/menu';
import { AdminPage } from '../admin/admin.component';
import { SettingsPage } from '../settings/settings';
import { DonationsWelcomePage } from '../donations/donations-welcome/donations-welcome';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { Subscription } from "rxjs";
import { FirebaseService } from '../../environments/firebase/firebase-service';

@Component({
    templateUrl: 'slide1.html',
    selector: 'slide1',
    providers: [AdminPage, SettingsPage, DonationsWelcomePage]
})

export class slide1Page {
    isAdmin: boolean = false;
    userObj: FirebaseObjectObservable<any>;
    userSubscription: Subscription;
    constructor(public nav: NavController,
        private firebaseService: FirebaseService,
        public af: AngularFire,
        public menuPage: MenuPage) {
        if (localStorage.getItem('isAdmin') === 'true') {
            this.isAdmin = true;
        }
        this.userObj = null;

        this.userSubscription = this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.firebaseService.getUsersByKey(auth.uid).subscribe(usrs => {
                    this.userObj = usrs[0];
                    localStorage.setItem('unitType', usrs[0].unittype)
                    localStorage.setItem('unitNumber', usrs[0].unitnumber.toString())
                    localStorage.setItem('userCouncils', usrs[0].councils.toString())
                });
            };
        });
    }

    setSelectedClass(button) {
        if (document.getElementById('adminPage')) {
            (document.getElementById('adminPage')).classList.remove("menu-selected");
        }

        (document.getElementById('settingsPage')).classList.remove("menu-selected");
        (document.getElementById('donationsPage')).classList.remove("menu-selected");

        (document.getElementById(button)).classList.add("menu-selected");
    }

    adminPage(button) {
        this.setSelectedClass(button);
        this.menuPage.nav.setRoot(AdminPage);
    }
    settingsPage(button) {
        this.setSelectedClass(button);
        this.menuPage.nav.setRoot(SettingsPage);
    }
    donationsPage(button) {
        this.setSelectedClass(button);
        this.menuPage.nav.setRoot(DonationsWelcomePage);
    }
}