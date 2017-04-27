import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Observable } from 'rxjs/Observable';
import { AgendaLitePage } from '../agenda-lite/agenda-lite';
import { AgendaPage } from '../agenda/agenda';

@Component({
    templateUrl: 'new-agenda.html',
    selector: 'new-agenda'
})
export class NewAgendaPage {
    constructor(public nav: NavController, public as: AppService, public firebaseservice: FirebaseService) {
    }

    agendalite() {
        this.nav.push(AgendaLitePage, { animate: true, direction: 'back' });
    }

    agenda() {
        this.nav.push(AgendaPage, { animate: true, direction: 'forward' });
    }

    cancel() {
        this.nav.pop({ animate: true, direction: 'down' });
    }
}