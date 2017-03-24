import { Component } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';

@Component({
    templateUrl: 'notifications.html',
    selector: 'notifications-page'
})

export class NotificationsPage {

    notificationsObj;

    constructor(private nav: NavController, public navParams: NavParams, ) {
        this.notificationsObj = navParams.get('myNotifications');
    }

    back() {
        this.nav.pop();
    }

}