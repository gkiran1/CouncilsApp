import { Injectable } from '@angular/core';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';

export class User {
    name: string;
    email: string;
    firstname: string;
    lastname: string;
    password: string;
    ldsusername: string;
    unittype: string;
    unitnumber: number;
    avatar: string;
    isadmin: boolean;
    createdby: string;
    createddate: string;
    lastupdateddate: string;
    isactive: boolean;
    calling: string;

    constructor(user) {
        this.name = user.name;
        this.email = user.email;
        this.firstname = user.firstname;
        this.lastname = user.lastname;
        this.password = user.password;
        this.ldsusername = user.ldsusername;
        this.unittype = user.unittype;
        this.unitnumber = user.unitnumber;
        this.avatar = user.avatar;
        this.isadmin = user.isadmin;
        this.createdby = user.createdby;
        this.createddate = user.createddate;
        this.lastupdateddate = user.lastupdateddate;
        this.isactive = user.isactive;
        this.calling = user.calling;
    }
}

@Injectable()
export class AppService {
    user: FirebaseObjectObservable<User>;
    uid;
    constructor(public af:AngularFire) {
        this.af.auth.subscribe(auth => {
            this.uid = auth.uid;
            this.user = this.af.database.object('/users/' + auth.uid);
        });
         
    }
    setUser(user: FirebaseObjectObservable<any>) {
        this.user = user;
        console.log('User details updated in AppService===>', this.user);
    }
    getUser(): FirebaseObjectObservable<User> {
        return this.user;
    }

}