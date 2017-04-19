import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Observable } from 'rxjs/Observable';
import { WelcomePage } from '../menu/menu';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { AgendaLiteEditPage } from '../agenda-lite-edit/agenda-lite-edit';
import { AgendaEditPage } from '../agenda-edit/agenda-edit';
import { Subject, } from 'rxjs/Subject';
import { Subscription } from "rxjs";

@Component({
    templateUrl: 'agendas.html',
    selector: 'agendas-page'
})
export class AgendasPage {

    user;
    agendasArray = [];
    count$ = new Subject();
    userSubscription: Subscription;

    constructor(public nav: NavController, public af: AngularFire, public firebaseservice: FirebaseService) {
        
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
                            this.count$.next(count);
                        });
                })
            }
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

}

