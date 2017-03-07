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

    fireAuth: any;
    rootRef: any;

    constructor(private af: AngularFire) {
        this.fireAuth = firebase.auth();
        this.rootRef = firebase.database().ref();
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
                calling: user.calling,
                avatar: user.avatar,
                isadmin: user.isadmin,
                createdby: user.createdby,
                createddate: user.createddate,
                lastupdateddate: user.lastupdateddate,
                isactive: user.isactive
            }).then(() => user.councils.forEach(counc => {
                this.createUserCouncils(uid, counc);
            }));
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

        var inviteee = this.rootRef.child('invitees').orderByChild('email').equalTo(invitee.email);
        return inviteee.once("value", function (snap) {
            if (!snap.exists()) {
                firebase.database().ref().child('invitees').push(
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
                    .then(() => {
                        return "User is successfully invited..."
                    })
                    .catch(err => { throw err });
            }
        }).then((res) => {
            console.log(res.val());
            if (res.val()) {
                throw "User has already invited..."
            }
            else {
                return "User is successfully invited..."
            }

        }).catch(err => { throw err });
    }

    getCouncilsByType(councilType: string): Observable<Council[]> {
        return this.af.database.list('councils', {
            query: {
                orderByChild: 'counciltype',
                equalTo: councilType
            }
        }).map(results => results);
    }


    getCouncilByKey(key: string): Observable<Council[]> {
        return this.af.database.list('councils', {
            query: {
                orderByKey: true,
                equalTo: key,
                limitToFirst: 1
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

    getUsersByCouncil(councilid: string): Observable<User[]> {
        return this.af.database.list('usercouncils', {
            query: {
                orderByChild: 'councilid',
                equalTo: councilid
            }
        });
    }
    createAssigment(assignment: any) {
        return this.rootRef.child('assignments').push(
            {
                assigneddate: assignment.assigneddate,
                assignedto: assignment.assigneduser,
                councilid: assignment.councilid,
                councilname: assignment.councilname,
                createdby: assignment.createdby,
                createddate: assignment.createddate,
                description: assignment.description,
                isactive: assignment.isactive,
                lastupdateddate: assignment.lastupdateddate,
                notes: assignment.notes,
                isCompleted: assignment.isCompleted
            })
            .then(() => {
                return "assignment created successfully..."
            })
            .catch(err => { throw err });
    }

    getAssignmentsByUserKey(userkey: string): FirebaseListObservable<any[]> {
        return this.af.database.list('assignments', {
            query: {
                orderByChild: 'assignedto',
                equalTo: userkey
            }
        });
    }
    getAssignmentsByCouncil(councilid: string): FirebaseListObservable<any[]> {
        return this.af.database.list('assignments', {
            query: {
                orderByChild: 'councilid',
                equalTo: councilid
            }
        });
    }

    getUserCounilKeysByUserKey(userkey: string): FirebaseListObservable<any[]> {
        return this.af.database.list('usercouncils', {
            query: {
                orderByChild: 'userid',
                equalTo: userkey
            }
        });
    }

    getAboutus() {
        var aboutusRef = this.rootRef.child('aboutus/-Kd9xpkjKGqdLVdNB_Gj');
        return aboutusRef.once('value').then(function (snapshot) {
            return snapshot.val();
        });
    }

    saveFeedback(comments, createdBy, createdDate) {
        this.rootRef.child('feedback').push({
            "comments": comments,
            "createdby": createdBy,
            "createddate": createdDate
        });
    }

    signOut() {
        return this.fireAuth.signOut().then(() => {
            console.log('Sign Out successfully..')
        }).catch(err => {
            throw err;
        });
    }

    updateCouncilsInUser(userUid: string, newCouncils: string[]) {
        return this.rootRef.child('users/' + userUid).update({ councils: newCouncils }).then(() => {
            return "councils in user updated successfully..."
        }).catch(err => {
            throw err;
        })
    }
    updateAssignment(assignment, assignmentKey) {
        console.log('assignment.$key', assignmentKey);
        return this.af.database.list('assignments').update(assignmentKey, {
            assigneddate: assignment.assigneddate,
            assignedto: assignment.assigneduser,
            councilid: assignment.councilid,
            councilname: assignment.councilname,
            createdby: assignment.createdby,
            createddate: assignment.createddate,
            description: assignment.description,
            isactive: assignment.isactive,
            lastupdateddate: assignment.lastupdateddate,
            notes: assignment.notes,
            isCompleted: assignment.isCompleted
        })
            .then(() => {
                return "Assignment has been updated!"
            })
            .catch(err => { throw err });
    }
    removeAssignment(assignmentKey) {
        console.log('assignment.$key', assignmentKey);
        return this.af.database.object('assignments/' + assignmentKey).remove();
    }
    updateProfile(userUid: string, firstname, lastname, email, phone, ldsusername) {
        return this.rootRef.child('users/' + userUid).update({ firstname, lastname, email, phone, ldsusername }).then(() => {
            return "user profile updated successfully..."
        }).catch(err => {
            throw err;
        })
    }
    // resetPassword(user) {
    //    return this.fireAuth.signInWithEmailAndPassword(user.email,user.password).then(() => {
    //         return "your old password matched.."
    //     }).catch(err => {
    //         throw err;
    //     })
    // }

}