import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { NavController, NavParams } from 'ionic-angular';
import { AgendaLitePage } from '../agenda-lite/agenda-lite';
import { FormBuilder, FormGroup } from '@angular/forms';

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

        this.nav.push(AgendaLitePage, { councilObj: value.council });
    }
    searchFn(event) {
        this.term = event.target.value;
    }
    cancel() {
        this.nav.pop({ animate: true, animation: 'transition', direction: 'back' });
    }
}