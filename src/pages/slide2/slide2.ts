import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Observable } from 'rxjs/Observable';
import { WelcomePage } from '../menu/menu';
import { AgendaPage } from '../agenda/agenda';
import { NewBlankAgendaPage } from '../new-blankagenda/new-blankagenda';

@Component({
    templateUrl: 'slide2.html',
    selector: 'slide2'
})
export class slide2Page {

}