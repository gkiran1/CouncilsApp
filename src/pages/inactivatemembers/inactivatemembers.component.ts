import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { User } from '../../user/user';
import { NavController } from 'ionic-angular';

@Component({
    templateUrl: 'inactivatemembers.html',
    selector: 'inactivatemembers.page'
})

export class InactivateMembersPage {
    users: User[] = [];
    userKeys = [];

    constructor(public appService: AppService, public firebaseService: FirebaseService, private nav: NavController) {
        this.appService.getUser().subscribe(usr => {
            this.firebaseService.getUsersByUnitNumber(usr.unitnumber).subscribe(usersObj => {
                this.users = usersObj;
                usersObj.forEach(userObj => {
                    var userCouncilNames: string[] = [];
                    userObj.councils.forEach(councilId => {
                        this.firebaseService.getCouncilByKey(councilId).subscribe((councilObj) => {
                            userCouncilNames.push(councilObj[0].council);
                            userObj.councilnames = userCouncilNames.join(', ');
                        });
                    });
                });
            });
        });
    }

    cancel() {
        this.nav.pop();
    }

}