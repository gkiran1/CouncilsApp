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
import {
    Auth, UserDetails, IDetailedError,
    Push, PushToken
} from '@ionic/cloud-angular';

@Injectable()
export class FirebaseService {

    fireAuth: any;
    rootRef: any;

    constructor(private af: AngularFire, public ionicAuth: Auth) {
        this.fireAuth = firebase.auth();
        this.rootRef = firebase.database().ref();
    }

    signupNewUser(user) {
        return this.fireAuth.createUserWithEmailAndPassword(user.email, user.password)
            .then((newUser) => {
                // Sign in the user.
                return this.fireAuth.signInWithEmailAndPassword(user.email, user.password)
                    .then((authenticatedUser) => {
                        let details: UserDetails = { 'email': user.email, 'password': user.password };
                        return this.ionicAuth.signup(details).then(() => {
                            // Successful login in firebase and ionic, create user profile.
                            this.createAuthUser(user, authenticatedUser.uid);
                        }).catch(function (error) {
                            throw error;
                        })
                    }).catch(function (error) {
                        throw error;
                    });
            }).catch(function (error) {
                throw error;
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
                isactive: user.isactive,
                guestpicture: user.avatar
            }).then(() => user.councils.forEach(counc => {
                this.createUserCouncils(uid, counc);
            }));
    }

    validateUser(email: string, password: string) {
        return this.fireAuth.signInWithEmailAndPassword(email, password)
            .then((authenticatedUser) => {
                let details: UserDetails = { 'email': email, 'password': password };
                return this.ionicAuth.login('basic', details).then(() => {
                    return authenticatedUser.uid;
                }).catch(err => {
                    throw err;
                })
            })
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

    //use below method to retreive council object by passing its id;
    getCouncilByCouncilKey(key: string): FirebaseObjectObservable<any> {
        return this.af.database.object('councils/' + key);
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

    getUsersByCouncil(councilid: string): Observable<any[]> {
        return this.af.database.list('usercouncils', {
            query: {
                orderByChild: 'councilid',
                equalTo: councilid
            }
        });
    }

    getUsersByKey(key: string): Observable<any[]> {
        return this.af.database.list('users', {
            query: {
                orderByKey: true,
                equalTo: key,
                limitToFirst: 1
            }
        }).map(results => results);
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
            this.ionicAuth.logout();
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

    inactivateUser(userUid: string, isactive: boolean) {
        return this.rootRef.child('users/' + userUid).update({ isactive: isactive }).then(() => {
            return "User inactivated successfully..."
        }).catch(err => {
            throw err;
        })
    }

    reactivateUser(userUid: string, isactive: boolean) {
        return this.rootRef.child('users/' + userUid).update({ isactive: isactive }).then(() => {
            return "User reactivated successfully..."
        }).catch(err => {
            throw err;
        })
    }

    transferAdminRights(currentAdminId, futureAdminId) {
        return this.rootRef.child('users/' + futureAdminId).update({ isadmin: true }).then(() => {
            return this.rootRef.child('users/' + currentAdminId).update({ isadmin: false }).then(() => {
                return "Admin rights transferred successfully..."
            });
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

    updateProfile(userUid: string, firstname, lastname, email, phone, ldsusername, avatar) {
        return this.rootRef.child('users/' + userUid).update({ firstname, lastname, email, phone, ldsusername, avatar }).then(() => {
            // user profile needs to be updated in discussions node as well.
            this.af.database.list('discussions').subscribe(discussions => {
                discussions.forEach(discussion => {
                    if (userUid === discussion.createdBy) {
                        this.af.database.object(`discussions/${discussion.$key}`).update({
                            createdUser: firstname + ' ' + lastname
                        });
                    }
                    this.af.database.list(`discussions/${discussion.$key}/messages`).subscribe(messages => {
                        messages.forEach(message => {
                            if (userUid === message.userId) {
                                console.log('discussion/messages========>', userUid, message.$key, avatar);
                                this.af.database.object(`discussions/${discussion.$key}/messages/${message.$key}`).update({
                                    user_firstname: firstname,
                                    user_lastname: lastname,
                                    user_avatar: avatar
                                });
                            }
                        });
                    });
                });
            });
            //updating privatediscussions
            this.af.database.list('privatediscussions').subscribe(discussions => {
                discussions.forEach(discussion => {
                    if (userUid === discussion.createdUserId) {
                        this.af.database.object(`privatediscussions/${discussion.$key}`).update({
                            createdUserAvatar: avatar,
                            createdUserName: firstname + ' ' + lastname
                        });
                    }
                    if (userUid === discussion.otherUserId) {
                        this.af.database.object(`privatediscussions/${discussion.$key}`).update({
                            otherUserAvatar: avatar,
                            otherUserName: firstname + ' ' + lastname
                        });
                    }
                    if (userUid === discussion.lastMsg.userId) {
                        this.af.database.object(`privatediscussions/${discussion.$key}/lastMsg`).update({
                            user_firstname: firstname,
                            user_lastname: lastname,
                            user_avatar: avatar
                        });
                    }
                    this.af.database.list(`privatediscussions/${discussion.$key}/messages`).subscribe(messages => {
                        messages.forEach(message => {
                            if (userUid === message.userId) {
                                console.log('privatediscussions/messages========>', userUid, message.$key, avatar);
                                this.af.database.object(`privatediscussions/${discussion.$key}/messages/${message.$key}`).update({
                                    user_firstname: firstname,
                                    user_lastname: lastname,
                                    user_avatar: avatar
                                });
                            }
                        });
                    });
                });
            });
            return "user profile updated successfully..."
        }).catch(err => {
            throw err;
        })
    }

    getAllCouncils(counciltype: string): FirebaseListObservable<any[]> {
        return this.af.database.list('councils', {
            query: {
                orderByChild: 'counciltype',
                equalTo: counciltype
            }
        });
    }

    createAgenda(agenda: any) {
        return this.rootRef.child('agendas').push({
            agendacouncil: agenda.assignedcouncil.council,
            councilid: agenda.assignedcouncil.$key,
            agendadate: agenda.assigneddate,
            agendatime: agenda.assignedtime,
            openinghymn: agenda.openinghymn.$key,
            openingprayer: agenda.openingprayer.$key,
            spiritualthought: agenda.spiritualthought.$key,
            highcounselorremarks: agenda.highcounselorremarks.$key,
            reviewassignments: agenda.reviewassignments.$key,
            spiritual: agenda.spiritual,
            temporalwelfare: agenda.temporalwelfare.$key,
            createdby: agenda.createdby,
            createddate: agenda.createddate,
            lastupdateddate: agenda.lastupdateddate,
            isactive: agenda.isactive,
        })
    }

    getAgendasByCouncilId(councilId: string) {
        return this.af.database.list('agendas', {
            query: {
                orderByChild: 'councilid',
                equalTo: councilId
            }
        })
    }

    createDiscussion(discussion: any) {
        return this.rootRef.child('discussions').push(
            {
                topic: discussion.topic,
                councilid: discussion.councilid,
                councilname: discussion.councilname,
                createdDate: discussion.createdDate,
                createdUser: discussion.createdUser,
                createdBy: discussion.createdBy,
                isActive: discussion.isActive,
                messages: discussion.messages,
                lastMsg: discussion.lastMsg
            })
            .then((res) => {
                //to get a reference of newly added object -res.path.o[1]
                return res.path.o[1];
            })
            .catch(err => { throw err });
    }


    updateAgenda(agenda, agendaKey) {
        return this.af.database.list('agendas').update(agendaKey, {
            agendacouncil: agenda.assignedcouncil.council,
            councilid: agenda.assignedcouncil.$key,
            agendadate: agenda.assigneddate,
            //  agendatime: agenda.assignedtime,
            openinghymn: agenda.openinghymn.$key,
            openingprayer: agenda.openingprayer.$key,
            spiritualthought: agenda.spiritualthought.$key,
            highcounselorremarks: agenda.highcounselorremarks.$key,
            reviewassignments: agenda.reviewassignments.$key,
            spiritual: agenda.spiritual,
            temporalwelfare: agenda.temporalwelfare.$key,
            createdby: agenda.createdby,
            lastupdateddate: agenda.lastupdateddate,
            isactive: agenda.isactive
        }).then(() => {
            return "Agenda has been updated."
        }).catch(err => { throw err });
    }

    removeAgenda(agendaKey) {
        console.log('agendas.$key', agendaKey);
        return this.af.database.object('agendas/' + agendaKey).remove();
    }
    updateDiscussionChat(discussionId, msg) {
        return this.af.database.list(`discussions/${discussionId}/messages`).push(msg)
            .then(() => {
                return this.af.database.object(`discussions/${discussionId}`).update({ lastMsg: msg.text });
            })
    }
    getDiscussionByKey(key) {
        return this.af.database.object(`discussions/${key}`);
    }
    getActiveUsersFromCouncil(councilId) {
        return this.af.database.list('usercouncils', {
            query: {
                orderByChild: 'councilid',
                equalTo: councilId
            }
        });
    }
    getDiscussions() {
        return this.af.database.list('discussions');
    }
    getUsers() {
        return this.af.database.list('users');
    }
    createPrivateDiscussion(discussion: any) {
        return this.rootRef.child('privatediscussions').push(
            {
                createdDate: discussion.createdDate,
                createdUserId: discussion.createdUserId,
                createdUserName: discussion.createdUserName,
                createdUserAvatar: discussion.createdUserAvatar,
                otherUserId: discussion.otherUserId,
                otherUserName: discussion.otherUserName,
                otherUserAvatar: discussion.otherUserAvatar,
                isActive: discussion.isActive,
                messages: discussion.messages,
                lastMsg: discussion.lastMsg
            })
            .then((res) => {
                //to get a reference of newly added object -res.path.o[1]
                return res.path.o[1];
            })
            .catch(err => { throw err });
    }
    getPrivateDiscussionByKey(key) {
        return this.af.database.object(`privatediscussions/${key}`);
    }
    updatePrivateDiscussionChat(discussionId, msg) {
        return this.af.database.list(`privatediscussions/${discussionId}/messages`).push(msg)
            .then(() => {
                return this.af.database.object(`privatediscussions/${discussionId}`).update({ lastMsg: msg });
            })
    }
    getPrivateDiscussions() {
        return this.af.database.list('privatediscussions');
    }

}