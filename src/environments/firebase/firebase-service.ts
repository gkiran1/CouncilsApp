import { Injectable } from '@angular/core';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable, FirebaseApp } from 'angularfire2';
import * as firebase from 'firebase';
//import { User } from '../../providers/app-service';
import { User } from '../../user/user';
import { Headers, Http, Response } from "@angular/http";
//import { Observable } from 'rxjs/Observable';
import { Invitee } from '../../pages/invite/invitee.model';
import { Observable, Subject } from "rxjs/Rx";
import { Council } from '../../pages/new-council/council';

@Injectable()
export class FirebaseService {

    fireAuth = firebase.auth();
    rootRef = firebase.database().ref();
    usr: any;
    constructor(private af: AngularFire) {
        this.usr = null;
    }

    signupNewUser(user) {
        return this.fireAuth.createUserWithEmailAndPassword(user.email, user.password)
            .then((newUser) => {
                // Sign in the user.
                return this.fireAuth.signInWithEmailAndPassword(user.email, user.password)
                    .then((authenticatedUser) => {
                        // Successful login, create user profile.
                        return this.createAuthUser(user, authenticatedUser.uid);
                    }).catch(function (error) {
                        throw error;
                        //alert(error.message);
                    });
            }).catch(function (error) {
                throw error;
                //alert(error.message);
            });
    }

    createAuthUser(user: User, uid: any) {
        return this.rootRef.child('users').child(uid).set(
            {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                password: user.password,
                ldsusername: user.ldsusername,
                unittype: user.unittype,
                unitnumber: user.unitnumber,
                councils: user.councils,
                avatar: user.avatar,
                isadmin: user.isadmin,
                createdby: user.createdby,
                createddate: user.createddate,
                lastupdateddate: user.lastupdateddate,
                isactive: user.isactive
            });
    }
    validateUser(email: string, password: string) {
        return this.fireAuth.signInWithEmailAndPassword(email, password)
            .then((authenticatedUser) => { return authenticatedUser.uid })
            .catch(err => {
                throw err;
            });
    }

    findUserByKey(userUid: string): Observable<User> {
        return this.af.database.object('users/' + userUid).map(result => result);
    }


    findInviteeByEmail(email: string): Observable<Invitee> {
        return this.af.database.list('invitees', {
            query: {
                orderByChild: 'email',
                equalTo: email
            }
        }).map(results => results[0]);
    }

    createInvitee(invitee: Invitee) {
        return this.rootRef.child('invitees').push(
            {
                email: invitee.email,
                firstname: invitee.firstname,
                lastname: invitee.lastname,
                calling: invitee.calling,
                unittype: invitee.unittype,
                unitnumber: invitee.unitnumber,
                councils: invitee.councils,
                createdby: invitee.createdby,
                createddate: invitee.createddate,
                lastupdateddate: invitee.lastupdateddate,
                isactive: true
            })
            .then(response => response)
            .catch(err => { throw err });
    }
    getCouncilsByKey(councilType: string): Observable<Council[]> {
        return this.af.database.list('councils', {
            query: {
                orderByChild: 'counciltype',
                equalTo: councilType
            }
        }).map(results => results);
    }

        getUsersByUnitNumber(unitnumber: number): Observable<User[]> {
        return this.af.database.list('users', {
            query: {
                orderByChild: 'unitnumber',
                equalTo: unitnumber
            }
        });
    }

    createCouncil(council: Council) {
        firebase.database().ref().child('councils').push(
            {
                council: council.council,
                firstname: council.counciltype
            })
            .then(() => {
                return "User is successfully invited..."
            })
            .catch(err => { throw err });
    }

    createUserCouncils(userUid: string, council: string) {
        this.rootRef.child('usercouncils').push({
            userid: userUid,
            councilid: council
        });

    }

    createCouncils(council: Council) {
        var counRef = this.rootRef.child('councils').orderByChild('council_counciltype').equalTo(council.council + '_' + council.counciltype).limitToFirst(1);
        return counRef.once('value').then(function (snapshot) {
            if (snapshot.val()) {
                // invalid council: Council already exists..
                return false;
            }
            else {
                return firebase.database().ref().child('councils').push(
                    {
                        council: council.council,
                        counciltype: council.counciltype,
                        council_counciltype: council.council + '_' + council.counciltype
                    }).then(res => {
                        return res.key;
                    }).catch(err => {
                        throw err;
                    });
            }
        }).catch(err => { throw err });
    }



}