import { Component } from '@angular/core';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AppService } from '../../providers/app-service';
import { AngularFire } from 'angularfire2';
import { NavController, NavParams } from 'ionic-angular';

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
                    if (u[0].isactive) {
                        this.usersArray.push(u[0]);
                    }
                });

            });
        });

    }
    cancel() {
        this.nav.pop({ animate: true, animation: 'transition', direction: 'back' });
    }

}