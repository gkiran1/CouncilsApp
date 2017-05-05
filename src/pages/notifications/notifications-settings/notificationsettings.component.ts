import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FirebaseService } from '../../../environments/firebase/firebase-service';

@Component({
    templateUrl: 'notificationsettings.html',
    selector: 'notificationsettings-page'
})

export class NotificationSettingsPage {
    notSettings;
    constructor(private nav: NavController, public firebaseService: FirebaseService) {
        var userId = localStorage.getItem('securityToken');
        firebaseService.setDefaultNotificationSettings(userId).then(() => {
            this.firebaseService.getNotificationSettings(userId).subscribe(settings => {
                this.notSettings = settings[0];
            });
        });
    }
    updateNotSettings() {
        this.firebaseService.updateNotificationSettings(this.notSettings.$key, this.notSettings);
    }
    back() {
        this.nav.pop({ animate: true, animation: 'transition', direction: 'back' });
    }
}