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
import { NativeAudio } from '@ionic-native/native-audio';

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

    constructor(public nav: NavController, public af: AngularFire, public firebaseservice: FirebaseService, private nativeAudio: NativeAudio) {

        this.userSubscription = this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.af.database.object('/users/' + auth.uid).subscribe(usr => {
                    this.user = usr;
                    af.database.list('/agendas')
                        .subscribe(agendas => {
                            this.agendasArray = [];
                            agendas.forEach(agenda => {
                                if (!agenda.isactive) return;
                                if (this.user.councils.includes(agenda.councilid)) {
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
            }
        });

        firebaseservice.getNotCnt().subscribe(count => {
            this.nativeAudio.play('chime');
            this.notificationsCount = count;
        });

    }

    agendaSelected(agendaselected) {
        if (agendaselected.islite) {
            this.nav.push(AgendaLiteEditPage, { agendaselected: agendaselected }, { animate: true, animation: 'transition', direction: 'forward' });
        }
        else {
            this.nav.push(AgendaEditPage, { agendaselected: agendaselected }, { animate: true, animation: 'transition', direction: 'forward' });
        }
    }

    getCount() {
        return this.count$;
    }

    notificationsPage() {
        this.nav.push(NewMenuPage);
    }

}

