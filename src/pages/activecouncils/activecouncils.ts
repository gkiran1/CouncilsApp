import { Component } from '@angular/core';
import { FirebaseService } from '../../environments/firebase/firebase-service';
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

    areaCouncils = []
    stakeCouncils = [];
    wardCouncils = [];
    addedCouncils = [];

    constructor(public af: AngularFire, public firebaseservice: FirebaseService, public nav: NavController) {

        var unitType = localStorage.getItem('unitType');

        this.userSubscription = this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.af.database.object('/users/' + auth.uid).subscribe(usr => {
                    this.user = usr;
                    this.myCouncils = [];
                    if (this.user.councils) {
                        this.user.councils.forEach(e => {
                            this.firebaseservice.getCouncilByKey(e).subscribe(council => {
                                //this.myCouncils.push(...council);


                                if (unitType === 'Area') {
                                    if (council[0]['under'] === 'Added') {
                                        this.addedCouncils.push(council[0]);
                                    }
                                    else if (council[0]['council'] === 'Stake Presidents') {
                                        this.stakeCouncils.push(council[0]);
                                    }
                                    else {
                                        this.areaCouncils.push(council[0]);
                                    }
                                }
                                else if (unitType === 'Stake') {
                                    if (council[0]['under'] === 'Added') {
                                        this.addedCouncils.push(council[0]);
                                    }
                                    else if (council[0]['council'] === 'Stake Presidents') {
                                        this.areaCouncils.push(council[0]);
                                    }
                                    else if (council[0]['council'] === 'Bishops') {
                                        this.wardCouncils.push(council[0]);
                                    }
                                    else {
                                        this.stakeCouncils.push(council[0]);
                                    }
                                }
                                else if (unitType === 'Ward') {
                                    if (council[0]['under'] === 'Added') {
                                        this.addedCouncils.push(council[0]);
                                    }
                                    else if (council[0]['council'] === 'Bishops') {
                                        this.stakeCouncils.push(council[0]);
                                    }
                                    else {
                                        this.wardCouncils.push(council[0]);
                                    }
                                }

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