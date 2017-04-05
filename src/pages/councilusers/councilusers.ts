import { Component } from '@angular/core';
import { FirebaseConfig } from '../../environments/firebase/firebase-config';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AppService } from '../../providers/app-service';
import * as firebase from 'firebase';
import { User } from '../../user/user';
import { Observable, Subject } from 'rxjs/Rx';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { Council } from '../new-council/council';
import { NavController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../menu/menu';

@Component({
    selector: 'page-councilusers',
    templateUrl: 'councilusers.html'
})

export class CouncilUsersPage {

    usersArray = [];
    council;
    constructor(public navParams: NavParams, public af: AngularFire, public firebaseservice: FirebaseService, public appservice: AppService, public nav: NavController) {

        this.council = navParams.get('council');

        let councilid = navParams.get('myCouncils');

        this.firebaseservice.getUsersByCouncil(councilid).subscribe(uc => {
            this.usersArray = [];
            uc.forEach(e => {
                this.firebaseservice.getUsersByKey(e.userid).subscribe(u => {
                    this.usersArray.push(u[0]);
                });

            });
        });

    }
    cancel() {
        this.nav.pop();
    }

}