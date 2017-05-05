import { Component } from '@angular/core';
import { FirebaseConfig } from '../../environments/firebase/firebase-config';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AppService } from '../../providers/app-service';
import { Subject } from 'rxjs/Rx';
import { AngularFire } from 'angularfire2';
import { NavController } from 'ionic-angular';
import { Subscription } from "rxjs";
import { CouncilUsersPage } from '../councilusers/councilusers';


@Component({
    selector: 'page-activecouncils',
    templateUrl: 'activecouncils.html'
})

export class ActiveCouncilsPage {
    users: any;
    myCouncils = [];
    count$ = new Subject();
    user;
    userSubscription: Subscription;

    constructor(public af: AngularFire, public firebaseservice: FirebaseService, public appservice: AppService, public nav: NavController) {
        this.userSubscription = this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.af.database.object('/users/' + auth.uid).subscribe(usr => {
                    this.user = usr;
                    this.myCouncils = [];
                    if (this.user.councils) {
                        this.user.councils.forEach(e => {
                            this.firebaseservice.getCouncilByKey(e).subscribe(councilObj => {
                                this.myCouncils.push(...councilObj);
                                this.count$.next(this.user.councils.length);
                            });
                        });
                    }
                });
            }
        });
    }

    cancel() {
        this.nav.pop({ animate: true, animation: 'transition', direction: 'back' });
    }

    getCount() {
        return this.count$;
    }
    usersincouncils(myCouncils, council) {
        this.nav.push(CouncilUsersPage, { myCouncils: myCouncils, council: council }, { animate: true, animation: 'transition', direction: 'forward' });
    }
}