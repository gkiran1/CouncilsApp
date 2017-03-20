import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Observable } from 'rxjs/Observable';
import { WelcomePage } from '../menu/menu';
import { AgendaLitePage } from '../agenda-lite/agenda-lite';
import { UnitTypeAgendaPage } from '../unittype-agenda/unittype-agenda';

@Component({
    templateUrl: 'new-agenda.html',
    selector: 'new-agenda'
})
export class NewAgendaPage {
    constructor(public nav: NavController, public as: AppService, public firebaseservice: FirebaseService) {
    }

    agendalite() {
         this.nav.push(AgendaLitePage);
    }

    agenda() {    
        this.nav.push(UnitTypeAgendaPage);
    }
    
    cancel() {
        this.nav.setRoot(WelcomePage);
    }
}