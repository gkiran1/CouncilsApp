import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Observable } from 'rxjs/Observable';
import { WelcomePage } from '../menu/menu';
import { AgendaPage } from '../agenda/agenda';
import { Subject } from 'rxjs/Subject';

@Component({
    templateUrl: 'agendas.html',
    selector: 'agendas'
})
export class AgendasPage {

    agendasArray = [];
    //subject = new Subject();
    count$ = new Subject();
    constructor(public nav: NavController, public as: AppService, public firebaseservice: FirebaseService) {
        var councilsIds = localStorage.getItem('userCouncils').split(',');
        councilsIds.forEach(councilId => {
            this.firebaseservice.getAgendasByCouncilId(councilId).subscribe(agendas => {
                this.agendasArray.push(...agendas);
                this.count$.next(this.agendasArray.length);
                // this.subject.next(this.agendasArray.length);
            });
        });

    }

    agendaSelected(agendaselected) {
        this.nav.push(AgendaPage, { agendaselected: agendaselected });
    }

    getCount() {
        return this.count$;
    }

    cancel() {
        this.nav.setRoot(WelcomePage);
    }

}

