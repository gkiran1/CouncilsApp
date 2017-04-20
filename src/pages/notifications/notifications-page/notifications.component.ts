import { Component } from '@angular/core';
import { NavParams, NavController, AlertController } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { NewAssignmentPage } from '../../assignments/new-assignment/new-assignment';
import { AgendaLiteEditPage } from '../../agenda-lite-edit/agenda-lite-edit';
import { AgendaEditPage } from '../../agenda-edit/agenda-edit';
import { OpenCouncilDiscussionPage } from '../../discussions/open-council-discussion/open-council-discussion';
import { OpenPrivateDiscussionPage } from '../../discussions/open-private-discussion/open-private-discussion';
import { ViewCouncilFilePage } from '../../files/view-council-file/view-council-file';

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
        public firebaseService: FirebaseService,
        public alertCtrl: AlertController) {
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
                if (agenda.isactive) {
                    if (agenda.islite) {
                        this.nav.push(AgendaLiteEditPage, { agendaselected: agenda });
                    }
                    else {
                        this.nav.push(AgendaEditPage, { agendaselected: agenda });
                    }
                }
                else {
                    this.showAlert('This agenda has been deleted!');
                }
            });
        }
        else if (notification.nodename === 'assignments') {
            this.firebaseService.getAssignmentByKey(notification.nodeid).subscribe(assignment => {
                if (assignment.isactive) {
                    this.nav.push(NewAssignmentPage, { assignment: assignment });
                }
                else {
                    this.showAlert('This assignment has been deleted!');
                }
            });
        }
        else if (notification.nodename === 'discussions') {
            this.nav.push(OpenCouncilDiscussionPage, { discussion: notification.nodeid })
        }
        else if (notification.nodename === 'privatediscussions') {
            this.nav.push(OpenPrivateDiscussionPage, { discussion: notification.nodeid })
        }
        else if (notification.nodename === 'files') {
            this.firebaseService.getFilesByKey(notification.nodeid).subscribe(file => {
                this.nav.push(ViewCouncilFilePage, { councilid: file.councilid, councilname: file.councilname });
            });
        }
    }

    showAlert(errText) {
        let alert = this.alertCtrl.create({
            title: '',
            subTitle: errText,
            buttons: ['OK']
        });
        alert.present();
    }

    cancel() {
        this.nav.pop().then(() => {
            this.notifications.forEach(notification => {
                this.firebaseService.updateIsReadInNotifications(notification.$key);
            });
        })
    }
}