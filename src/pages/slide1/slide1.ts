import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AdminPage } from '../admin/admin.component';
import { SettingsPage } from '../settings/settings';
import { DonationsWelcomePage } from '../donations/donations-welcome/donations-welcome';

@Component({
    templateUrl: 'slide1.html',
    selector: 'slide1'
})

export class slide1Page {
    isAdmin: boolean = false;
    constructor(public nav: NavController) {
        if (localStorage.getItem('isAdmin') === 'true') {
            this.isAdmin = true;
        }
        console.log(this.isAdmin);
    }

    adminPage() {
        this.nav.push(AdminPage);
    }
    settingsPage() {
        this.nav.push(SettingsPage);
    }
    donationsPage() {
        this.nav.push(DonationsWelcomePage);
    }
}