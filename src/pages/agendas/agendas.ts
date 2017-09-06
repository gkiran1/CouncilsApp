import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Observable } from 'rxjs/Observable';
import { MenuPage } from '../menu/menu';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { AgendaLiteEditPage } from '../agenda-lite-edit/agenda-lite-edit';
import { AgendaEditPage } from '../agenda-edit/agenda-edit';
import { Subject, } from 'rxjs/Subject';
import { Subscription } from "rxjs";
import { NotificationsPage } from '../notifications/notifications-page/notifications.component';
import { NewMenuPage } from '../newmenu/newmenu';

@Component({
    templateUrl: 'agendas.html',
    selector: 'agendas-page'
})
export class AgendasPage {

    user;
    agendasArray = [];
    count$ = new Subject();
    userSubscription: Subscription;
    notificationsCount;
    agendasCount;
    unreadAgendas = [];

    constructor(public nav: NavController, public af: AngularFire, public firebaseservice: FirebaseService) {

        this.userSubscription = this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.af.database.object('/users/' + auth.uid).subscribe(usr => {
                    this.user = usr;

                    this.firebaseservice.getNotificationsByUserId(auth.uid).subscribe(notifications => {

                        this.unreadAgendas = [];

                        notifications.forEach(notification => {
                            if (notification.nodename === 'agendas' && notification.isread === false && notification.action === 'create') {
                                this.unreadAgendas.push(notification);
                            }
                        });

                        this.agendasCount = this.unreadAgendas.length;

                        af.database.list('/agendas')
                            .subscribe(agendas => {
                                this.agendasArray = [];
                                agendas.forEach(agenda => {
                                    if (!agenda.isactive) return;
                                    agenda['isread'] = true;
                                    if (this.user.councils.includes(agenda.councilid)) {
                                        var unreadAgenda = this.unreadAgendas.find(not => not.nodeid === agenda.$key);
                                        if (unreadAgenda) {
                                            agenda['isread'] = false;
                                            agenda['notificationKey'] = unreadAgenda.$key;
                                        }
                                        this.agendasArray.push(agenda);
                                    }
                                });

                                let count = this.agendasArray.length;
                                count = count ? count : null;
                                this.count$.next(count);

                                this.agendasArray.sort(function (a, b) {
                                    return (a.createddate > b.createddate) ? -1 : ((a.createddate < b.createddate) ? 1 : 0);
                                });

                            });

                    });

                });
            }
        });

        firebaseservice.getNotCnt().subscribe(count => {
            this.notificationsCount = count;
        });

        // firebaseservice.getAgendasNotCnt().subscribe(count => {
        //     this.agendasCount = count;
        // });

    }

    agendaSelected(agendaselected) {

        if (agendaselected.islite) {
            this.nav.push(AgendaLiteEditPage, { agendaselected: agendaselected }, { animate: true, animation: 'transition', direction: 'forward' })
                .then(() => {
                    if (!agendaselected.isread) {
                        this.firebaseservice.updateIsReadInNotifications(agendaselected.notificationKey);
                        agendaselected.isread = true;
                    }
                });
        }
        else {
            this.nav.push(AgendaEditPage, { agendaselected: agendaselected }, { animate: true, animation: 'transition', direction: 'forward' })
                .then(() => {
                    if (!agendaselected.isread) {
                        this.firebaseservice.updateIsReadInNotifications(agendaselected.notificationKey);
                        agendaselected.isread = true;
                    }
                });
        }
    }

    getCount() {
        return this.count$;
    }

    notificationsPage() {
        this.nav.push(NewMenuPage);
    }

}

