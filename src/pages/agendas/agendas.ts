import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Observable } from 'rxjs/Observable';
import { WelcomePage } from '../menu/menu';
import { AgendaLiteEditPage } from '../agenda-lite-edit/agenda-lite-edit';
import { AgendaEditPage } from '../agenda-edit/agenda-edit';
import { Subject } from 'rxjs/Subject';
import { NotificationsPage } from '../notifications/notifications-page/notifications.component';

@Component({
    templateUrl: 'agendas.html',
    selector: 'agendas-page'
})
export class AgendasPage {

    agendasArray = [];
    count$ = new Subject();
    notificationsCount;

    constructor(public nav: NavController, public as: AppService, public firebaseservice: FirebaseService) {
        this.agendasArray = [];
        if (localStorage.getItem('userCouncils') !== null) {
            var councilsIds = localStorage.getItem('userCouncils').split(',');
            councilsIds.forEach(councilId => {
                this.firebaseservice.getAgendasByCouncilId(councilId).subscribe(agendas => {
                    this.agendasArray.push(...agendas);
                    this.count$.next(this.agendasArray.length);
                });
            });
        }

        this.firebaseservice.getNotCnt().subscribe(count => {
            this.notificationsCount = count;
        });

    }

    agendaSelected(agendaselected) {
        if (agendaselected.islite) {
            this.nav.push(AgendaLiteEditPage, { agendaselected: agendaselected });
        }
        else {
            this.nav.push(AgendaEditPage, { agendaselected: agendaselected });
        }
    }

    getCount() {
        return this.count$;
    }

    cancel() {
        this.nav.setRoot(WelcomePage);
    }

    notificationsPage() {
        this.nav.push(NotificationsPage);
    }

}

