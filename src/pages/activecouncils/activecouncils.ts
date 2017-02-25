import { Component } from '@angular/core';
import { FirebaseConfig } from '../../environments/firebase/firebase-config';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AppService } from '../../providers/app-service';
import * as firebase from 'firebase';
import { User } from '../../user/user';
import { Observable,Subject } from 'rxjs/Rx';
import { AngularFire, FirebaseObjectObservable,FirebaseListObservable } from 'angularfire2';
import { Council } from '../new-council/council';

@Component({
    selector: 'activecouncils',
    templateUrl: 'activecouncils.html'
})

export class ActiveCouncilsPage {
    users: any;
    //  newCouncil: Council = new Council();
    myCouncils = [];
    count$ = new Subject();

    constructor(public af: AngularFire, public firebaseservice: FirebaseService, public appservice: AppService) {
        this.appservice.getUser().subscribe(user => {

            this.firebaseservice.getUserCounilKeysByUserKey(user.$key).subscribe((usercouncil) => {
                console.log('usercouncils', usercouncil);
                this.myCouncils = [];
                usercouncil.forEach(e => {
                    //  this.myCouncils.push(this.firebaseservice.getCouncilByKey(e.councilid))
                   this.firebaseservice.getCouncilByKey(e.councilid).subscribe(councilObj=>{
                    this.myCouncils.push(...councilObj);
                    this.count$.next(this.myCouncils.length);
                   });
                   
                });
            });
      
        });
    }
    getCount(){
        return this.count$;
    }

}