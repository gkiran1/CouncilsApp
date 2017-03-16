import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AlertController, NavController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../menu/menu';
import { NewAgendaPage } from '../new-agenda/new-agenda';
import { NewBlankAgendaPage } from '../new-blankagenda/new-blankagenda';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    templateUrl: 'unittype-agenda.html',
    selector: 'page-unittypeagenda'
})
export class UnitTypeAgendaPage {

    councils = [];
    unitypeagendaForm: FormGroup;
    term: string = '';

    constructor(navParams: NavParams, fb: FormBuilder, public appservice: AppService,
        public firebaseservice: FirebaseService,
        public nav: NavController) {

        var councilsIds = localStorage.getItem('userCouncils').split(',');
        councilsIds.forEach(councilId => {
            this.firebaseservice.getCouncilByKey(councilId).subscribe(councilObj => {
                this.councils.push(...councilObj);

            });
        });

        this.unitypeagendaForm = fb.group({
            council: ''
        });

    }

    done(value) {

        this.nav.push(NewBlankAgendaPage, { councilObj: value.council });
    }
    searchFn(event) {
        this.term = event.target.value;
        console.log('search', event.target.value);
    }
    cancel() {
        this.nav.pop();
    }
}