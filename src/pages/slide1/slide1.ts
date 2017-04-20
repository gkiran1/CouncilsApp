import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MenuPage } from '../menu/menu';
import { AdminPage } from '../admin/admin.component';
import { SettingsPage } from '../settings/settings';
import { DonationsWelcomePage } from '../donations/donations-welcome/donations-welcome';

@Component({
    templateUrl: 'slide1.html',
    selector: 'slide1',
    providers: [AdminPage, SettingsPage, DonationsWelcomePage]
})

export class slide1Page {
    isAdmin: boolean = false;
    constructor(public nav: NavController,
    public menuPage: MenuPage) {
        if (localStorage.getItem('isAdmin') === 'true') {
            this.isAdmin = true;
        }
        console.log(this.isAdmin);
    }

    adminPage() {
        this.menuPage.nav.setRoot(AdminPage);
    }
    settingsPage() {
        this.menuPage.nav.setRoot(SettingsPage);
    }
    donationsPage() {
        this.menuPage.nav.setRoot(DonationsWelcomePage);
    }
}