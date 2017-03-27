import { Component } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
import { FirebaseService } from '../../../environments/firebase/firebase-service';

@Component({
    templateUrl: 'notifications.html',
    selector: 'notifications-page'
})

export class NotificationsPage {

    notifications;
    notificationsCount;
    count$ = new Subject();

    constructor(private nav: NavController,
        public navParams: NavParams,
        public firebaseService: FirebaseService) {
        var userId = localStorage.getItem('securityToken');
        if (userId !== null) {
            this.notifications = [];
            this.firebaseService.getNotifications(userId).subscribe(notifications => {
                this.notifications = notifications.filter(notification => {
                    return notification.isread === false;
                });
                this.count$.next(this.notifications.length);
                console.log(this.notifications);
            });
        }
    }

    getCount() {
        return this.count$;
    }

    ActivityPage() {

    }

    back() {
        this.nav.pop().then(() => {
            this.notifications.forEach(notification => {
                this.firebaseService.updateIsReadInNotifications(notification.$key);
            });
        })
    }
}