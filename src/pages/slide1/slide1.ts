import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Observable } from 'rxjs/Observable';
import { WelcomePage } from '../menu/menu';
import { AgendaPage } from '../agenda/agenda';
import { NewBlankAgendaPage } from '../new-blankagenda/new-blankagenda';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { AdminPage } from '../admin/admin.component';

@Component({
    templateUrl: 'slide1.html',
    selector: 'slide1'
})

export class slide1Page {

    constructor(public nav: NavController,
        public af: AngularFire) {

    }

    adminPage() {
        this.nav.setRoot(AdminPage);
    }
}