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
<<<<<<< HEAD
    councils: string[]; 
=======
    councils: string[];
>>>>>>> origin/Sprint1
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
        this.councils = user.councils;
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
<<<<<<< HEAD
    constructor(public af:AngularFire) {
=======
    constructor(public af: AngularFire) {
>>>>>>> origin/Sprint1
        // this.af.auth.subscribe(auth => {
        //     this.uid = auth.uid;
        //     this.user = this.af.database.object('/users/' + auth.uid);
        // });
<<<<<<< HEAD
          this.user = this.af.database.object('/users/CcvXnVmIEuMcajPYGqZCKPPyA6z1');
         
=======
        this.user = this.af.database.object('/users/CcvXnVmIEuMcajPYGqZCKPPyA6z1')
        this.uid = 'CcvXnVmIEuMcajPYGqZCKPPyA6z1'

>>>>>>> origin/Sprint1
    }
    setUser(user: FirebaseObjectObservable<any>) {
        this.user = user;
        console.log('User details updated in AppService===>', this.user);
    }
    getUser(): FirebaseObjectObservable<User> {
        return this.user;
    }

}