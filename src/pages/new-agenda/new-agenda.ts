import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Observable } from 'rxjs/Observable';
import { WelcomePage } from '../menu/menu';
import { AgendaPage } from '../agenda/agenda';
import { NewBlankAgendaPage } from '../new-blankagenda/new-blankagenda';
import { UnitTypeAgendaPage } from '../unittype-agenda/unittype-agenda';

@Component({
    templateUrl: 'new-agenda.html',
    selector: 'new-agenda'
})
export class NewAgendaPage {
    unitType;
    constructor(public nav: NavController, public as: AppService, public firebaseservice: FirebaseService) {
        this.unitType = localStorage.getItem('unitType');
    }

    unittypeagenda() {
         this.nav.push(UnitTypeAgendaPage);
    }

    blankagenda() {    
        this.nav.push(NewBlankAgendaPage);
    }
    
    cancel() {
        this.nav.setRoot(WelcomePage);
    }
}