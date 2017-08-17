import { Component } from '@angular/core';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AngularFire } from 'angularfire2';
import { NavController, NavParams, ViewController } from 'ionic-angular';

@Component({
    selector: 'page-councilusersmodal',
    templateUrl: 'council-users.html'
})

export class CouncilUsersModalPage {

    usersArray = [];
    uid
    constructor(public navParams: NavParams, public firebaseservice: FirebaseService, public viewCtrl: ViewController) {

        let councilid = navParams.get('councilid');
        this.uid = localStorage.getItem('securityToken');

        this.firebaseservice.getUsersByCouncil(councilid).subscribe(uc => {
            this.usersArray = [];
            uc.forEach(e => {
                this.firebaseservice.getUsersByKey(e.userid).subscribe(u => {
                    if (u[0] && u[0].isactive) {
                        this.firebaseservice.checkNetworkStatus(u[0].$key, function (status) {
                            u[0].status = status ? '#3cb18a' : '#a9aaac';
                        });
                        this.usersArray.push(u[0]);
                        this.usersArray.sort(function (a, b) {
                            return (a.status === '#3cb18a' && b.status === '#a9aaac') ? -1 : ((a.status === '#a9aaac' && b.status === '#3cb18a') ? 1 : 0);
                        });
                    }
                });
            });
        });

    }
    dismiss(user) {
        this.viewCtrl.dismiss(user);
    }

}