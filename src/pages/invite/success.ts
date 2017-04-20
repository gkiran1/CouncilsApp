import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { NavController } from 'ionic-angular';
import { InviteMemberPage } from './invite';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';

@Component({
    selector: 'page-success',
    templateUrl: 'success.html'
})
export class InvitationSuccessPage {
    userObj;
    constructor(public appservice: AppService, public navctrl: NavController, public af: AngularFire) {
        this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.af.database.object('/users/' + auth.uid).subscribe(res => {
                    this.userObj = res;
                });
            }
        });
        // this.userObj = appservice.user;
    }
    inviteanother() {
        this.navctrl.setRoot(InviteMemberPage);
    }
    close() {
        this.navctrl.pop();
    }
}