import { Component } from '@angular/core';
import { NavParams, NavController } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { NewAssignmentPage } from '../../assignments/new-assignment/new-assignment';
import { AgendaLiteEditPage } from '../../agenda-lite-edit/agenda-lite-edit';
import { AgendaEditPage } from '../../agenda-edit/agenda-edit';
import { OpenCouncilDiscussionPage } from '../../discussions/open-council-discussion/open-council-discussion';
import { OpenPrivateDiscussionPage } from '../../discussions/open-private-discussion/open-private-discussion';

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

    ActivityPage(notification) {
        if (notification.nodename === 'agendas') {
            this.firebaseService.getAgendaByKey(notification.nodeid).subscribe(agenda => {
                if (agenda.islite) {
                    this.nav.push(AgendaLiteEditPage, { agendaselected: agenda });
                }
                else {
                    this.nav.push(AgendaEditPage, { agendaselected: agenda });
                }
            });
        }
        else if (notification.nodename === 'assignments') {
            this.firebaseService.getAssignmentByKey(notification.nodeid).subscribe(assignment => {
                this.nav.push(NewAssignmentPage, { assignment: assignment });
            });
        }
        else if (notification.nodename === 'discussions') {
            this.nav.push(OpenCouncilDiscussionPage, { discussion: notification.nodeid })
        }
        else if (notification.nodename === 'privatediscussions') {
            this.nav.push(OpenPrivateDiscussionPage, { discussion: notification.nodeid })
        }
    }

    back() {
        this.nav.pop().then(() => {
            this.notifications.forEach(notification => {
                this.firebaseService.updateIsReadInNotifications(notification.$key);
            });
        })
    }
}