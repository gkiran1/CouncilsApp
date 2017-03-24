import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { NavController, NavParams, ViewController } from 'ionic-angular';

@Component({
    selector: 'page-councilusersmodal',
    templateUrl: 'councilusers.html'
})

export class CouncilUsersModalPage {

    usersArray = [];
    constructor(public navParams: NavParams, public firebaseservice: FirebaseService,public viewCtrl: ViewController) {

        let councilid = navParams.get('councilid');

        this.firebaseservice.getUsersByCouncil(councilid).subscribe(uc => {
            uc.forEach(e => {
                this.firebaseservice.getUsersByKey(e.userid).subscribe(u => {
                    this.usersArray.push(u[0]);
                });

            });
        });

    }
    dismiss(user){
        this.viewCtrl.dismiss(user);
    }

}