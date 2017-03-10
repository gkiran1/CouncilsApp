import { Component } from '@angular/core';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { User } from '../../user/user';

@Component({
    templateUrl: 'inactivatemembers.html',
    selector: 'inactivatemembers.page'
})

export class InactivateMembersPage {
    users: User[] = [];
    userKeys = [];

    constructor(public appService: AppService, public firebaseService: FirebaseService) {
        this.appService.getUser().subscribe(usr => {
            usr.councils.forEach(councilId => {
                this.firebaseService.getUsersByCouncil(councilId).subscribe(councilUsers => {
                    councilUsers.forEach(councilUsr => {
                        this.firebaseService.findUserByKey(councilUsr.userid).subscribe(usrObj => {
                            if (usr.$key !== usrObj.$key) {
                                this.userKeys.push(usrObj.$key);
                                if (this.userKeys.indexOf(usrObj.$key) === this.userKeys.lastIndexOf(usrObj.$key)) {
                                    var userCouncilNames: string[] = [];
                                    usrObj.councils.forEach(councilId => {
                                        this.firebaseService.getCouncilByKey(councilId).subscribe((councilObj) => {
                                            userCouncilNames.push(councilObj[0].council);
                                            usrObj.councilnames = userCouncilNames.join(', ');
                                        });
                                    });
                                    this.users.push(usrObj);
                                }
                            }
                        });
                    });
                });
            });
        });

        //console.log(this.users);

    }
}