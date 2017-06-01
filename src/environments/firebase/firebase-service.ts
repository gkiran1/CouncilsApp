import { Injectable } from '@angular/core';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable, FirebaseApp } from 'angularfire2';
import * as firebase from 'firebase';
import { User } from '../../user/user';
import { Headers, Http, Response, RequestOptions } from "@angular/http";
import { Invitee } from '../../pages/invite/invitee.model';
import { Observable, Subject, Subscription } from "rxjs/Rx";
import { Council } from '../../pages/new-council/council';


let baseURL = 'https://fcm.googleapis.com';
let url = baseURL + '/fcm/send';

// var options = {
//     protocol: 'https:',
//     hostname: 'fcm.googleapis.com',
//     path: '/fcm/send',
//     port: 443,
//     json: true,
//     method: 'POST',
//     headers: {
//         "content-type": "application/json",
//         "Authorization": "key=" + "AAAASC34Gto:APA91bEXDfky2ZWKDfD3Ct-HZgQ06hqN0SO4XMEVYutJArXcy64sLfjAqY6tong21l7yzHEyaA8CERppvBxkGhrP2D5i1nbTDPw-Bxx3rIOeShkJ-nRoZMAbRej-A-X8LvIM10IYpgiO"
//     }
// };


let headers = new Headers({
    "content-type": "application/json",
    "Authorization": "key=" + "AAAASC34Gto:APA91bEXDfky2ZWKDfD3Ct-HZgQ06hqN0SO4XMEVYutJArXcy64sLfjAqY6tong21l7yzHEyaA8CERppvBxkGhrP2D5i1nbTDPw-Bxx3rIOeShkJ-nRoZMAbRej-A-X8LvIM10IYpgiO"
});

let options = new RequestOptions({ headers: headers });

@Injectable()
export class FirebaseService {

    fireAuth: any;
    rootRef: any;
    ht: any;

    constructor(private af: AngularFire, public http: Http) {
        this.fireAuth = firebase.auth();
        this.rootRef = firebase.database().ref();
        this.ht = http;
    }

    signupNewUser(user, userAvatar) {
        return this.fireAuth.createUserWithEmailAndPassword(user.email, user.password)
            .then((newUser) => {
                // Sign in the user.
                return this.fireAuth.signInWithEmailAndPassword(user.email, user.password)
                    .then((authenticatedUser) => {
                        // Successful login in firebase, create user profile.
                        this.createAuthUser(user, authenticatedUser.uid).then(res => {
                            this.saveIdenticon(authenticatedUser.uid, userAvatar);
                        });
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
                guestpicture: user.avatar,
                isnotificationreq: false,
                googlecalendaradded: false
            }).then(() => user.councils.forEach(counc => {
                this.createUserCouncils(uid, counc);
            }));
    }

    saveIdenticon(uid: string, img: string) {
        let avatarRef = firebase.storage().ref('/users/avatar/');

        avatarRef.child(uid)
            .putString(img, 'base64', { contentType: 'image/svg+xml' })
            .then((savedPicture) => {
                this.rootRef.child('users').child(uid).update({
                    avatar: savedPicture.downloadURL
                }).then(done => {
                    console.log('Avatar saved');
                }).catch(err => {
                    console.log('Avatar failed to save.', err);
                });

            }).catch(err => {
                console.log('Error storing image', err);
            });

    }

    validateUser(email: string, password: string) {
        return this.fireAuth.signInWithEmailAndPassword(email, password)
            .then((authenticatedUser) => {
                return authenticatedUser.uid;
            })
            .catch(err => {
                throw err;
            });
    }

    findUserByKey(userUid: string): Observable<User> {
        return this.af.database.object('users/' + userUid).map(result => result);
    }

    findUserByEmail(email: string): Observable<Invitee> {
        return this.af.database.list('users', {
            query: {
                orderByChild: 'email',
                equalTo: email
            }
        }).map(results => results[0]);
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
                        // calling: invitee.calling,
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
            if (res.val()) {
                throw "User has already invited..."
            }
            else {
                return "User is successfully invited..."
            }

        }).catch(err => { throw err });
    }

    getCouncilsByType(unitNumber: string): Observable<Council[]> {
        return this.af.database.list('councils', {
            query: {
                orderByChild: 'unitnumber',
                equalTo: unitNumber
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

    createUserCouncils(userUid: string, council: string) {
        this.rootRef.child('usercouncils').push({
            userid: userUid,
            councilid: council
        });

    }

    createCouncils(council: Council) {
        var counRef = this.rootRef.child('councils').orderByChild('council_unitnumber').equalTo(council.council + '_' + council.unitnumber).limitToFirst(1);
        return counRef.once('value').then(function (snapshot) {
            if (snapshot.val()) {
                // invalid council: Council already exists..
                return false;
            }
            else {
                return firebase.database().ref().child('councils').push(
                    {
                        council: council.council,
                        unittype: council.counciltype,
                        unitnumber: Number(council.unitnumber),
                        council_unitnumber: council + '_' + council.unitnumber
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
                assigneduser: assignment.assignedusername,
                councilid: assignment.councilid,
                councilname: assignment.councilname,
                createdby: assignment.createdby,
                createddate: assignment.createddate,
                description: assignment.description,
                isactive: assignment.isactive,
                lastupdateddate: assignment.lastupdateddate,
                notes: assignment.notes,
                isCompleted: assignment.isCompleted,
                completedby: assignment.completedby
            })
            .then((res) => {
                this.assignmentsTrigger(res.path.o[1], assignment);
                return res.path.o[1];
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
        let about: any;
        var aboutusRef = this.rootRef.child('aboutus');
        return aboutusRef.orderByChild('createddate').limitToLast(1).once('value').then(function (snapshot) {
            if (snapshot.val())
                return snapshot;
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
        }).catch(err => {
            throw err;
        });
    }

    updateCouncilsInUser(userUid: string, newCouncils: string[]) {
        return this.rootRef.child('users/' + userUid).update({ councils: newCouncils }).then(() => {
            return "councils in user updated successfully..."
        }).catch(err => {
            throw err;
        });
    }

    deleteCouncilsInUserCouncils(usrId) {
        var userCouncilsRef = this.rootRef.child('usercouncils').orderByChild('userid').equalTo(usrId);
        return userCouncilsRef.once('value').then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                firebase.database().ref().child('usercouncils/' + childSnapshot.key).remove();
            });
            return true;
        });
    }

    inactivateUser(userUid: string, isactive: boolean, pushtoken: string) {
        return this.rootRef.child('users/' + userUid).update({ isactive: isactive, isnotificationreq: true }).then(() => {
            return "User inactivated successfully..."
        }).then(() => {
            this.rootRef.child('users/' + userUid).update({ isnotificationreq: false }).then(() => {
                this.userUpdateTrigger(userUid, 'inactivate', pushtoken);
            });
        }).catch(err => {
            throw err;
        });
    }

    reactivateUser(userUid: string, isactive: boolean, pushtoken: string) {
        return this.rootRef.child('users/' + userUid).update({ isactive: isactive, isnotificationreq: true }).then(() => {
            return "User reactivated successfully..."
        }).then(() => {
            this.rootRef.child('users/' + userUid).update({ isnotificationreq: false }).then(() => {
                this.userUpdateTrigger(userUid, 'activate', pushtoken);
            });
        }).catch(err => {
            throw err;
        });
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
        return this.af.database.list('assignments').update(assignmentKey, {
            assigneddate: assignment.assigneddate,
            assignedto: assignment.assigneduser,
            assigneduser: assignment.assignedusername,
            councilid: assignment.councilid,
            councilname: assignment.councilname,
            createdby: assignment.createdby,
            createddate: assignment.createddate,
            description: assignment.description,
            isactive: assignment.isactive,
            lastupdateddate: assignment.lastupdateddate,
            notes: assignment.notes,
            isCompleted: assignment.isCompleted,
            completedby: assignment.completedby
        })
            .then(() => {
                this.assignmentsUpdateTrigger(assignmentKey, assignment);
                return "Assignment has been updated!"
            })
            .catch(err => { throw err });
    }

    removeAssignment(assignmentKey, assignment) {
        return this.af.database.object('assignments/' + assignmentKey).update({ isactive: false }).then(() => {
            if (assignment !== null) {
                this.assignmentsDeleteTrigger(assignmentKey, assignment);
            }
        });
    }

    updateProfileInfo(userUid: string, firstname, lastname, email, phone, ldsusername) {
        return this.rootRef.child('users/' + userUid).update({ firstname, lastname, email, phone, ldsusername }).then(() => {
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
                                this.af.database.object(`discussions/${discussion.$key}/messages/${message.$key}`).update({
                                    user_firstname: firstname,
                                    user_lastname: lastname
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
                            createdUserName: firstname + ' ' + lastname
                        });
                    }
                    if (userUid === discussion.otherUserId) {
                        this.af.database.object(`privatediscussions/${discussion.$key}`).update({
                            otherUserName: firstname + ' ' + lastname,
                            otherUserEmail: email
                        });
                    }
                    if (userUid === discussion.lastMsg.userId) {
                        this.af.database.object(`privatediscussions/${discussion.$key}/lastMsg`).update({
                            user_firstname: firstname,
                            user_lastname: lastname

                        });
                    }
                    this.af.database.list(`privatediscussions/${discussion.$key}/messages`).subscribe(messages => {
                        messages.forEach(message => {
                            if (userUid === message.userId) {
                                this.af.database.object(`privatediscussions/${discussion.$key}/messages/${message.$key}`).update({
                                    user_firstname: firstname,
                                    user_lastname: lastname
                                });
                            }
                        });
                    });
                });
            });
            this.af.database.list('activities', {
                query: {
                    orderByChild: 'createdUserId',
                    equalTo: userUid
                }
            })
                .take(1).subscribe(activities => {
                    activities.forEach(activity => {
                        this.af.database.object('activities/' + activity.$key).update({
                            createdUserName: firstname + ' ' + lastname
                        });
                    });
                });
            return "user profile updated successfully..."
        }).catch(err => {
            throw err;
        })
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
                            otherUserName: firstname + ' ' + lastname,
                            otherUserEmail: email
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
            this.af.database.list('activities', {
                query: {
                    orderByChild: 'createdUserId',
                    equalTo: userUid
                }
            })
                .take(1).subscribe(activities => {
                    activities.forEach(activity => {
                        this.af.database.object('activities/' + activity.$key).update({
                            createdUserName: firstname + ' ' + lastname,
                            createdUserAvatar: avatar
                        });
                    });
                });
            return "user profile updated successfully..."
        }).catch(err => {
            throw err;
        })
    }

    createAgendaLite(agenda: any) {
        return this.rootRef.child('agendas').push({
            agendacouncil: agenda.assignedcouncil,
            councilid: agenda.councilid,
            agendadate: agenda.assigneddate,
            openinghymn: agenda.openinghymn,
            openingprayer: agenda.openingprayer,
            openingprayeruserid: agenda.openingprayeruserid,
            spiritualthought: agenda.spiritualthought,
            spiritualthoughtuserid: agenda.spiritualthoughtuserid,
            assignments: agenda.assignments.$key ? agenda.assignments.$key : '',
            completedassignments: agenda.completedassignments.$key ? agenda.completedassignments.$key : '',
            discussionitems: agenda.discussionitems,
            closingprayer: agenda.closingprayer,
            closingprayeruserid: agenda.closingprayeruserid,
            createdby: agenda.createdby,
            createddate: agenda.createddate,
            // lastupdateddate: agenda.lastupdateddate,
            isactive: agenda.isactive,
            islite: true,
            editedby: ''
        })
            .then((res) => {
                this.agendasTrigger(res.path.o[1], agenda);
                return res.path.o[1];
            })
            .catch(err => { throw err });
    }

    getAgendasByCouncilId(councilId: string) {
        return this.af.database.list('agendas', {
            query: {
                orderByChild: 'councilid',
                equalTo: councilId
            }
        })
    }

    getFilesByCouncilId(councilId: string) {
        return this.af.database.list('files', {
            query: {
                orderByChild: 'councilid',
                equalTo: councilId,
                limitToLast: 1
            }
        }).map(results => results);
    }

    getFilesByCouncil(councilId: any) {
        return this.af.database.list('files', {
            query: {
                orderByChild: 'councilid',
                equalTo: councilId
            }
        }).take(1).map(results => results);
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
                lastMsg: discussion.lastMsg,
                lastMsgSentUser: discussion.lastMsgSentUser,
                typings: discussion.typings,
                isNotificationReq: discussion.isNotificationReq
            })
            .then((res) => {
                this.discussionsTrigger(res.path.o[1], discussion);
                return res.path.o[1];  //to get a reference of newly added object -res.path.o[1]
            })
            .catch(err => { throw err });
    }

    saveFile(file: any) {
        return this.rootRef.child('files').push(
            {
                filename: file.filename,
                filesize: file.filesize,
                filetype: file.filetype,
                councilid: file.councilid,
                councilname: file.councilname,
                createdDate: file.createdDate,
                createdUser: file.createdUser,
                createdBy: file.createdBy,
                isActive: file.isActive,
            })
            .then((res) => {
                this.filesTrigger(res.path.o[1], file);
                //to get a reference of newly added object -res.path.o[1]
                return res.path.o[1];
            })
            .catch(err => {
                throw err
            });
    }

    updateAgendaLite(agenda, agendaKey) {
        return this.af.database.list('agendas').update(agendaKey, {
            agendacouncil: agenda.assignedcouncil,
            councilid: agenda.councilid,
            agendadate: agenda.assigneddate,
            openinghymn: agenda.openinghymn,
            openingprayer: agenda.openingprayer,
            openingprayeruserid: agenda.openingprayeruserid,
            spiritualthought: agenda.spiritualthought,
            spiritualthoughtuserid: agenda.spiritualthoughtuserid,
            assignments: agenda.assignments,
            completedassignments: agenda.completedassignments,
            discussionitems: agenda.discussionitems,
            closingprayer: agenda.closingprayer,
            closingprayeruserid: agenda.closingprayeruserid,
            createdby: agenda.createdby,
            createddate: agenda.createddate,
            lastupdateddate: agenda.lastupdateddate,
            isactive: agenda.isactive,
            islite: true,
            editedby: agenda.editedby
        }).then(() => {
            this.agendasUpdateTrigger(agendaKey, agenda);
            return "Agenda Lite has been updated."
        }).catch(err => { throw err });
    }

    removeAgendaLite(agendaKey, agenda) {
        return this.af.database.object('agendas/' + agendaKey).update({ isactive: false }).then(() => {
            this.agendasDeleteTrigger(agendaKey, agenda);
        });
    }

    createAgenda(agenda: any) {
        return this.rootRef.child('agendas').push({
            agendacouncil: agenda.assignedcouncil,
            councilid: agenda.councilid,
            agendadate: agenda.assigneddate,
            openinghymn: agenda.openinghymn,
            openingprayer: agenda.openingprayer,
            openingprayeruserid: agenda.openingprayeruserid,
            spiritualthought: agenda.spiritualthought,
            spiritualthoughtuserid: agenda.spiritualthoughtuserid,
            assignments: agenda.assignments.$key ? agenda.assignments.$key : '',
            completedassignments: agenda.completedassignments.$key ? agenda.completedassignments.$key : '',
            spiritualwelfare: agenda.spiritualwelfare,
            temporalwelfare: agenda.temporalwelfare,
            fellowshipitems: agenda.fellowshipitems,
            missionaryitems: agenda.missionaryitems,
            event: agenda.event,
            closingprayer: agenda.closingprayer,
            closingprayeruserid: agenda.closingprayeruserid,
            createdby: agenda.createdby,
            createddate: agenda.createddate,
            // lastupdateddate: agenda.lastupdateddate,
            isactive: agenda.isactive,
            islite: false,
            editedby: ''
        })
            .then((res) => {
                this.agendasTrigger(res.path.o[1], agenda);
                return res.path.o[1];
            })
            .catch(err => { throw err });
    }

    updateAgenda(agenda, agendaKey) {
        return this.af.database.list('agendas').update(agendaKey, {
            agendacouncil: agenda.assignedcouncil,
            councilid: agenda.councilid,
            agendadate: agenda.assigneddate,
            openinghymn: agenda.openinghymn,
            openingprayer: agenda.openingprayer,
            openingprayeruserid: agenda.openingprayeruserid,
            spiritualthought: agenda.spiritualthought,
            spiritualthoughtuserid: agenda.spiritualthoughtuserid,
            assignments: agenda.assignments,
            completedassignments: agenda.completedassignments,
            spiritualwelfare: agenda.spiritualwelfare,
            temporalwelfare: agenda.temporalwelfare,
            fellowshipitems: agenda.fellowshipitems,
            missionaryitems: agenda.missionaryitems,
            event: agenda.event,
            closingprayer: agenda.closingprayer,
            closingprayeruserid: agenda.closingprayeruserid,
            createdby: agenda.createdby,
            createddate: agenda.createddate,
            lastupdateddate: agenda.lastupdateddate,
            isactive: agenda.isactive,
            islite: false,
            editedby: agenda.editedby
        }).then(() => {
            this.agendasUpdateTrigger(agendaKey, agenda);
            return "Agenda Lite has been updated."
        }).catch(err => { throw err });
    }

    removeAgenda(agendaKey, agenda) {
        return this.af.database.object('agendas/' + agendaKey).update({ isactive: false }).then(() => {
            this.agendasDeleteTrigger(agendaKey, agenda);
        });
    }

    updateDiscussionChat(discussionId, msg, discussion) {
        return this.af.database.list(`discussions/${discussionId}/messages`).push(msg)
            .then(() => {
                return this.af.database.object(`discussions/${discussionId}`)
                    .update({ lastMsg: msg.text, lastMsgSentUser: msg.user_firstname + ' ' + msg.user_lastname, isNotificationReq: true }).then(() => {
                        this.discussionsUpdateTrigger(msg, discussion);
                    });
            });
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
                createdUserEmail: discussion.createdUserEmail,
                otherUserId: discussion.otherUserId,
                otherUserName: discussion.otherUserName,
                otherUserAvatar: discussion.otherUserAvatar,
                otherUserEmail: discussion.otherUser.email,
                isActive: discussion.isActive,
                messages: discussion.messages,
                lastMsg: discussion.lastMsg,
                typings: discussion.typings,
                isNotificationReq: discussion.isNotificationReq
            })
            .then((res) => {
                this.privateDiscussionsTrigger(res.path.o[1], discussion);
                //to get a reference of newly added object -res.path.o[1]
                return res.path.o[1];
            })
            .catch(err => { throw err });
    }

    getPrivateDiscussionByKey(key) {
        return this.af.database.object(`privatediscussions/${key}`);
    }

    updatePrivateDiscussionChat(discussionId, msg, discussion) {
        return this.af.database.list(`privatediscussions/${discussionId}/messages`).push(msg)
            .then(() => {
                return this.af.database.object(`privatediscussions/${discussionId}`).update({ lastMsg: msg, isNotificationReq: true }).then(() => {
                    this.privateDiscussionsUpdateTrigger(msg, discussion);
                });
            });
    }

    getPrivateDiscussions() {
        return this.af.database.list('privatediscussions');
    }

    getFilesByKey(key) {
        return this.af.database.object(`files/${key}`);
    }

    updateDiscussion(discussionId, typings) {
        return this.af.database.object(`discussions/${discussionId}`).update({ typings: typings, isNotificationReq: false });
    }

    updatePrivateDiscussion(discussionId, typings) {
        return this.af.database.object(`privatediscussions/${discussionId}`).update({ typings: typings, isNotificationReq: false });
    }

    updatePrivateDiscussionMessageStatus(discussionId, messageId, status) {
        return this.af.database.object(`privatediscussions/${discussionId}/messages/${messageId}`).update({ status: status, isNotificationReq: false });
    }

    getNotifications(userId) {
        return this.af.database.list('notifications', {
            query: {
                orderByChild: 'userid',
                equalTo: userId,
                limitToLast: 50
            }
        });
    }

    count$ = new Subject();

    getNotCnt() {
        var userId = localStorage.getItem('securityToken');
        if (userId !== null) {
            var notifications = [];
            this.getNotifications(userId).subscribe(notifications => {
                notifications = notifications.filter(notification => {
                    return notification.isread === false;
                });
                this.count$.next(notifications.length);
            });
        }
        return this.count$;
    }

    setDefaultNotificationSettings(userId) {
        var notSettingsRef = this.rootRef.child('notificationsettings').orderByChild('userid').equalTo(userId);
        return notSettingsRef.once("value", function (snap) {
            if (!snap.exists()) {
                return firebase.database().ref().child('notificationsettings').push({
                    userid: userId,
                    allactivity: false,
                    agendas: false,
                    discussions: false,
                    pvtdiscussions: false,
                    assignments: false,
                    closingassignment: false,
                    files: false,
                    actinactaccount: false
                });
            }
        });
    }

    getNotificationSettings(userId) {
        return this.af.database.list('notificationsettings', {
            query: {
                orderByChild: 'userid',
                equalTo: userId,
                limitToFirst: 1
            }
        });
    }

    updateNotificationSettings(key, notSettings) {
        return this.af.database.list('notificationsettings').update(key, {
            allactivity: notSettings.allactivity,
            agendas: notSettings.agendas,
            discussions: notSettings.discussions,
            pvtdiscussions: notSettings.pvtdiscussions,
            assignments: notSettings.assignments,
            closingassignment: notSettings.closingassignment,
            files: notSettings.files,
            actinactaccount: notSettings.actinactaccount
        }).then(() => {
            return "User notification settings has been updated."
        }).catch(err => { throw err });
    }

    updateIsReadInNotifications(key) {
        return this.af.database.object('notifications/' + key).update({ isread: true });
    }

    getAgendaByKey(key) {
        return this.af.database.object('agendas/' + key);
    }

    getAssignmentByKey(key) {
        return this.af.database.object('assignments/' + key);
    }

    deleteFilesByKey(key) {
        return this.af.database.object(`files/${key}`).remove().then(() => {
            return "file deleted from database."
        }).catch(err => { alert(err) });
    }

    checkNetworkStatus(uid, callback) {
        let userRef = this.rootRef.child('/presence/' + uid);
        userRef.on('value', function (snapshot) {
            callback(snapshot.val());
        });
    }

    createNote(note: any) {
        return this.rootRef.child('notes').push(
            {
                createdby: note.createdby,
                createddate: note.createddate,
                title: note.title,
                note: note.note,
            })
    }

    getNotes(userId) {
        return this.af.database.list('notes', {
            query: {
                orderByChild: 'createdby',
                equalTo: userId
            }
        });
    }

    updateNote(note, notekey) {
        return this.af.database.list('notes').update(notekey, {
            createdby: note.createdby,
            createddate: note.createddate,
            title: note.title,
            note: note.note,
        }).then(() => {
            return "Note has been updated."
        }).catch(err => { throw err });
    }

    removeNote(notekey) {
        return this.af.database.object('notes/' + notekey).remove();
    }

    getAgendas() {
        return this.af.database.list('agendas');
    }

    updateOpeningPrayerInAgendas(agendaKey) {
        return this.af.database.object('agendas/' + agendaKey).update({
            openingprayer: '',
            openingprayeruserid: ''
        });
    }

    updateSpiritualThoughtInAgendas(agendaKey) {
        return this.af.database.object('agendas/' + agendaKey).update({
            spiritualthought: '',
            spiritualthoughtuserid: ''
        });
    }

    updateClosingPrayerInAgendas(agendaKey) {
        return this.af.database.object('agendas/' + agendaKey).update({
            closingprayer: '',
            closingprayeruserid: ''
        });
    }

    createActivity(activity) {
        return this.rootRef.child('activities').push({
            userid: activity.userid,
            entity: activity.entity,
            entityid: activity.entityid,
            entityDescription: activity.entityDescription || '',
            action: activity.action,
            councilid: activity.councilid,
            councilname: activity.councilname,
            timestamp: activity.timestamp,
            createdUserId: activity.createdUserId,
            createdUserName: activity.createdUserName,
            createdUserAvatar: activity.createdUserAvatar
        });
    }

    removeActivities(entityId) {
        var activitiesRef = firebase.database().ref().child('activities').orderByChild('entityid').equalTo(entityId);

        activitiesRef.once('value').then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                firebase.database().ref().child('activities/' + childSnapshot.key).remove();
            });
            return true;
        });
    }

    getActivities(userId) {
        return this.af.database.list('activities', {
            query: {
                orderByChild: 'userid',
                equalTo: userId
            }
        });
    }

    updateToken(userUid) {
        return this.rootRef.child('users/' + userUid).update({ pushtoken: localStorage.getItem('pushtoken') }).then(() => {
            console.log('updated token');
        }).catch(err => {
            throw err;
        });
    }

    emptyToken(userUid) {
        return this.rootRef.child('users/' + userUid).update({ pushtoken: "" }).then(() => {
            console.log('updated token');
        }).catch(err => {
            throw err;
        });
    }

    sendForgotEmailLink(email) {
        return firebase.auth().sendPasswordResetEmail(email).then(() => {
            console.log('Mail Sent');
        }).catch((err) => {
            throw err;
        });
    }

    // -----------------------------------------Start Notifications --------------------------------------------------- //

    // Agendas Create Trigger ------------------------
    agendasTrigger(agendaKey, agendaObj) {
        var httpObj = this.http;
        var agendaId = agendaKey;
        var description = agendaObj.assignedcouncil;
        var createdBy = agendaObj.createdby;
        var userKeys = [];
        var notificationRef = firebase.database().ref().child('notifications').orderByChild('nodeid').equalTo(agendaId);
        notificationRef.once("value", function (snap) {
            if (!snap.exists()) {
                var councilUsersRef = firebase.database().ref().child('usercouncils').orderByChild('councilid').equalTo(agendaObj.councilid);
                councilUsersRef.once('value').then(function (usrsSnapshot) {
                    usrsSnapshot.forEach(usrObj => {
                        var id = usrObj.val()['userid'];
                        userKeys.push(id);
                        if (userKeys.indexOf(id) === userKeys.lastIndexOf(id)) {
                            var notSettingsRef = firebase.database().ref().child('notificationsettings').orderByChild('userid').equalTo(id);
                            notSettingsRef.once('value', function (notSnap) {
                                if (notSnap.exists()) {
                                    notSnap.forEach(notSetting => {
                                        if (notSetting.val()['allactivity'] === true || notSetting.val()['agendas'] === true) {
                                            var usrRef = firebase.database().ref().child('users/' + id);
                                            usrRef.once('value').then(function (usrSnapshot) {
                                                if (usrSnapshot.val()['isactive'] === true) {

                                                    var pushtkn = usrSnapshot.val()['pushtoken'];
                                                    var email = usrSnapshot.val()['email'];

                                                    firebase.database().ref().child('notifications').push({
                                                        userid: id,
                                                        nodeid: agendaId,
                                                        nodename: 'agendas',
                                                        description: description,
                                                        action: 'create',
                                                        text: 'New ' + description + ' agenda posted',
                                                        createddate: new Date().toISOString(),
                                                        createdtime: new Date().toTimeString(),
                                                        createdby: createdBy,
                                                        isread: false
                                                    }).catch(err => {
                                                        console.log('firebase error:' + err);
                                                        throw err
                                                    });

                                                    if (pushtkn !== undefined && pushtkn !== '') {
                                                        var push = {
                                                            notification: {
                                                                body: 'New ' + description + ' agenda posted',
                                                                title: "Councils",
                                                                sound: "default",
                                                                icon: "icon"
                                                            },
                                                            content_available: true,
                                                            to: pushtkn,
                                                            priority: 'high'
                                                        };

                                                        options['body'] = JSON.stringify(push);

                                                        httpObj.post(url, JSON.stringify(push), options)
                                                            .subscribe(response => {
                                                                console.log('notification sent');
                                                            }, err => {
                                                                console.log('notification not sent, something went wrong');
                                                            });
                                                    }
                                                }

                                            });
                                            return true; // to stop the loop.
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            } else {
                console.log('Snapshot null');
            }
        });
    }

    // Agendas Update Trigger ------------------------
    agendasUpdateTrigger(agendaKey, agendaObj) {
        var httpObj = this.http;
        var agendaId = agendaKey;
        var description = agendaObj.assignedcouncil;
        var createdBy = agendaObj.createdby;
        var editedBy = agendaObj.editedby;
        var userKeys = [];

        var txt = editedBy + ' edited ' + description + ' agenda';

        var notificationRef = firebase.database().ref().child('notifications').orderByChild('nodeid').equalTo(agendaId);
        notificationRef.once("value", function (snap) {
            if (snap.exists()) {
                var councilUsersRef = firebase.database().ref().child('usercouncils').orderByChild('councilid').equalTo(agendaObj.councilid);
                councilUsersRef.once('value').then(function (usrsSnapshot) {
                    usrsSnapshot.forEach(usrObj => {
                        var id = usrObj.val()['userid'];
                        userKeys.push(id);
                        if (userKeys.indexOf(id) === userKeys.lastIndexOf(id)) {
                            var notSettingsRef = firebase.database().ref().child('notificationsettings').orderByChild('userid').equalTo(id);
                            notSettingsRef.once('value', function (notSnap) {
                                if (notSnap.exists()) {
                                    notSnap.forEach(notSetting => {
                                        if (notSetting.val()['allactivity'] === true || notSetting.val()['agendas'] === true) {
                                            var usrRef = firebase.database().ref().child('users/' + id);
                                            usrRef.once('value').then(function (usrSnapshot) {
                                                if (usrSnapshot.val()['isactive'] === true) {

                                                    var pushtkn = usrSnapshot.val()['pushtoken'];

                                                    firebase.database().ref().child('notifications').push({
                                                        userid: id,
                                                        nodeid: agendaId,
                                                        nodename: 'agendas',
                                                        description: description,
                                                        action: 'edit',
                                                        text: txt,
                                                        createddate: new Date().toISOString(),
                                                        createdtime: new Date().toTimeString(),
                                                        createdby: createdBy,
                                                        isread: false
                                                    }).catch(err => {
                                                        throw err
                                                    });

                                                    if (pushtkn !== undefined && pushtkn !== '') {
                                                        var push = {
                                                            notification: {
                                                                body: txt,
                                                                title: "Councils",
                                                                sound: "default",
                                                                icon: "icon"
                                                            },
                                                            content_available: true,
                                                            to: pushtkn,
                                                            priority: 'high'
                                                        };

                                                        options['body'] = JSON.stringify(push);

                                                        httpObj.post(url, JSON.stringify(push), options)
                                                            .subscribe(response => {
                                                                console.log('notification sent');
                                                            }, err => {
                                                                console.log('notification not sent, something went wrong');
                                                            });
                                                    }
                                                }
                                            });
                                            return true; // to stop the loop.
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            }
        });
        // }

    }

    // Agendas Delete Trigger ------------------------
    agendasDeleteTrigger(agendaKey, agendaObj) {
        var httpObj = this.http;
        var agendaId = agendaKey;
        var description = agendaObj.agendacouncil;
        var createdBy = agendaObj.createdby;
        var editedBy = agendaObj.editedby;
        var userKeys = [];

        var txt = description + ' agenda ' + 'deleted';

        var notificationRef = firebase.database().ref().child('notifications').orderByChild('nodeid').equalTo(agendaId);
        notificationRef.once('value').then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                firebase.database().ref().child('notifications/' + childSnapshot.key).remove();
            });
            return true;
        }).then(() => {
            var councilUsersRef = firebase.database().ref().child('usercouncils').orderByChild('councilid').equalTo(agendaObj.councilid);
            councilUsersRef.once('value').then(function (usrsSnapshot) {
                usrsSnapshot.forEach(usrObj => {
                    var id = usrObj.val()['userid'];
                    userKeys.push(id);
                    if (userKeys.indexOf(id) === userKeys.lastIndexOf(id)) {
                        var notSettingsRef = firebase.database().ref().child('notificationsettings').orderByChild('userid').equalTo(id);
                        notSettingsRef.once('value', function (notSnap) {
                            if (notSnap.exists()) {
                                notSnap.forEach(notSetting => {
                                    if (notSetting.val()['allactivity'] === true || notSetting.val()['agendas'] === true) {
                                        var usrRef = firebase.database().ref().child('users/' + id);
                                        usrRef.once('value').then(function (usrSnapshot) {
                                            if (usrSnapshot.val()['isactive'] === true) {

                                                var pushtkn = usrSnapshot.val()['pushtoken'];

                                                firebase.database().ref().child('notifications').push({
                                                    userid: id,
                                                    nodeid: agendaId,
                                                    nodename: 'agendas',
                                                    description: description,
                                                    action: 'delete',
                                                    text: txt,
                                                    createddate: new Date().toISOString(),
                                                    createdtime: new Date().toTimeString(),
                                                    createdby: createdBy,
                                                    isread: false
                                                }).catch(err => {
                                                    throw err
                                                });

                                                if (pushtkn !== undefined && pushtkn !== '') {
                                                    var push = {
                                                        notification: {
                                                            body: txt,
                                                            title: "Councils",
                                                            sound: "default",
                                                            icon: "icon"
                                                        },
                                                        content_available: true,
                                                        to: pushtkn,
                                                        priority: 'high'
                                                    };

                                                    options['body'] = JSON.stringify(push);

                                                    httpObj.post(url, JSON.stringify(push), options)
                                                        .subscribe(response => {
                                                            console.log('notification sent');
                                                        }, err => {
                                                            console.log('notification not sent, something went wrong');
                                                        });
                                                }

                                            }
                                        });
                                        return true; // to stop the loop.
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });
    }

    // Assignments Trigger ------------------------
    assignmentsTrigger(assignmentKey, assignmentObj) {
        var httpObj = this.http;
        var assignmentId = assignmentKey;
        var description = assignmentObj.description;
        var assignedUser = assignmentObj.assignedusername;
        var createdBy = assignmentObj.createdby;
        var userKeys = [];
        var notificationRef = firebase.database().ref().child('notifications').orderByChild('nodeid').equalTo(assignmentId);
        notificationRef.once("value", function (snap) {
            if (!snap.exists()) {
                var councilUsersRef = firebase.database().ref().child('usercouncils').orderByChild('councilid').equalTo(assignmentObj.councilid);
                councilUsersRef.once('value').then(function (usrsSnapshot) {
                    usrsSnapshot.forEach(usrObj => {
                        var id = usrObj.val()['userid'];
                        userKeys.push(id);
                        if (userKeys.indexOf(id) === userKeys.lastIndexOf(id)) {
                            var notSettingsRef = firebase.database().ref().child('notificationsettings').orderByChild('userid').equalTo(id);
                            notSettingsRef.once('value', function (notSnap) {
                                if (notSnap.exists()) {
                                    notSnap.forEach(notSetting => {
                                        if (notSetting.val()['allactivity'] === true || notSetting.val()['assignments'] === true) {
                                            var usrRef = firebase.database().ref().child('users/' + id);
                                            usrRef.once('value').then(function (usrSnapshot) {
                                                if (usrSnapshot.val()['isactive'] === true) {

                                                    var pushtkn = usrSnapshot.val()['pushtoken'];

                                                    firebase.database().ref().child('notifications').push({
                                                        userid: id,
                                                        nodeid: assignmentId,
                                                        nodename: 'assignments',
                                                        description: description,
                                                        action: 'create',
                                                        text: description + ' accepted by ' + assignedUser,
                                                        createddate: new Date().toISOString(),
                                                        createdtime: new Date().toTimeString(),
                                                        createdby: createdBy,
                                                        isread: false
                                                    }).catch(err => {
                                                        throw err
                                                    });

                                                    if (pushtkn !== undefined && pushtkn !== '') {
                                                        var push = {
                                                            notification: {
                                                                body: description + ' accepted by ' + assignedUser,
                                                                title: "Councils",
                                                                sound: "default",
                                                                icon: "icon"
                                                            },
                                                            content_available: true,
                                                            to: pushtkn,
                                                            priority: 'high'
                                                        };

                                                        options['body'] = JSON.stringify(push);

                                                        httpObj.post(url, JSON.stringify(push), options)
                                                            .subscribe(response => {
                                                                console.log('notification sent');
                                                            }, err => {
                                                                console.log('notification not sent, something went wrong');
                                                            });
                                                    }

                                                }
                                            });
                                            return true; // to stop the loop.
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            }
        });

    }

    // Assignments Complete & Edit Trigger ------------------------
    assignmentsUpdateTrigger(assignmentKey, assignmentObj) {
        var httpObj = this.http;
        var assignmentId = assignmentKey;
        var description = assignmentObj.description;
        var createdBy = assignmentObj.createdby;
        var completedBy = assignmentObj.completedby;
        var userKeys = [];

        var action = '';
        var txt = '';
        var text = '';

        if (assignmentObj.isCompleted === true) {
            action = 'completed';
            txt = 'update';
            text = completedBy + ' completed ' + description;
        } else if (assignmentObj.isCompleted === false) {
            action = 'edited';
            txt = 'edit';
            text = description + ' edited';
        }

        if (action === 'completed' || action === 'edited') {
            var notificationRef = firebase.database().ref().child('notifications').orderByChild('nodeid').equalTo(assignmentId);
            notificationRef.once("value", function (snap) {
                if ((snap.exists() && action === 'completed') || (snap.exists() && action === 'deleted') || (snap.exists() && action === 'edited')) {
                    var councilUsersRef = firebase.database().ref().child('usercouncils').orderByChild('councilid').equalTo(assignmentObj.councilid);
                    councilUsersRef.once('value').then(function (usrsSnapshot) {
                        usrsSnapshot.forEach(usrObj => {
                            var id = usrObj.val()['userid'];
                            userKeys.push(id);
                            if (userKeys.indexOf(id) === userKeys.lastIndexOf(id)) {
                                var notSettingsRef = firebase.database().ref().child('notificationsettings').orderByChild('userid').equalTo(id);
                                notSettingsRef.once('value', function (notSnap) {
                                    if (notSnap.exists()) {
                                        notSnap.forEach(notSetting => {
                                            if (notSetting.val()['allactivity'] === true || notSetting.val()['assignments'] === true) {
                                                var usrRef = firebase.database().ref().child('users/' + id);
                                                usrRef.once('value').then(function (usrSnapshot) {
                                                    if (usrSnapshot.val()['isactive'] === true) {

                                                        var pushtkn = usrSnapshot.val()['pushtoken'];

                                                        firebase.database().ref().child('notifications').push({
                                                            userid: id,
                                                            nodeid: assignmentId,
                                                            nodename: 'assignments',
                                                            description: description,
                                                            action: txt,
                                                            text: text,
                                                            createddate: new Date().toISOString(),
                                                            createdtime: new Date().toTimeString(),
                                                            createdby: createdBy,
                                                            isread: false
                                                        }).catch(err => {
                                                            throw err
                                                        });

                                                        if (pushtkn !== undefined && pushtkn !== '') {
                                                            var push = {
                                                                notification: {
                                                                    body: text,
                                                                    title: "Councils",
                                                                    sound: "default",
                                                                    icon: "icon"
                                                                },
                                                                content_available: true,
                                                                to: pushtkn,
                                                                priority: 'high'
                                                            };

                                                            options['body'] = JSON.stringify(push);

                                                            httpObj.post(url, JSON.stringify(push), options)
                                                                .subscribe(response => {
                                                                    console.log('notification sent');
                                                                }, err => {
                                                                    console.log('notification not sent, something went wrong');
                                                                });
                                                        }

                                                    }
                                                });
                                                return true; // to stop the loop.
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
            });
        }
    }

    // Assignments Update & Delete Trigger ------------------------
    assignmentsDeleteTrigger(assignmentKey, assignmentObj) {
        var httpObj = this.http;
        var assignmentId = assignmentKey;
        var description = assignmentObj.description;
        var createdBy = assignmentObj.createdby;
        var completedBy = assignmentObj.completedby;
        var userKeys = [];

        var action = 'deleted';
        var txt = 'delete';
        var text = description + ' deleted';

        var notificationRef = firebase.database().ref().child('notifications').orderByChild('nodeid').equalTo(assignmentId);
        notificationRef.once('value').then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                firebase.database().ref().child('notifications/' + childSnapshot.key).remove();
            });
            return true;
        }).then(() => {
            var councilUsersRef = firebase.database().ref().child('usercouncils').orderByChild('councilid').equalTo(assignmentObj.councilid);
            councilUsersRef.once('value').then(function (usrsSnapshot) {
                usrsSnapshot.forEach(usrObj => {
                    var id = usrObj.val()['userid'];
                    userKeys.push(id);
                    if (userKeys.indexOf(id) === userKeys.lastIndexOf(id)) {
                        var notSettingsRef = firebase.database().ref().child('notificationsettings').orderByChild('userid').equalTo(id);
                        notSettingsRef.once('value', function (notSnap) {
                            if (notSnap.exists()) {
                                notSnap.forEach(notSetting => {
                                    if (notSetting.val()['allactivity'] === true || notSetting.val()['assignments'] === true) {
                                        var usrRef = firebase.database().ref().child('users/' + id);
                                        usrRef.once('value').then(function (usrSnapshot) {
                                            if (usrSnapshot.val()['isactive'] === true) {

                                                var pushtkn = usrSnapshot.val()['pushtoken'];

                                                firebase.database().ref().child('notifications').push({
                                                    userid: id,
                                                    nodeid: assignmentId,
                                                    nodename: 'assignments',
                                                    description: description,
                                                    action: txt,
                                                    text: text,
                                                    createddate: new Date().toISOString(),
                                                    createdtime: new Date().toTimeString(),
                                                    createdby: createdBy,
                                                    isread: false
                                                }).catch(err => {
                                                    throw err
                                                });

                                                if (pushtkn !== undefined && pushtkn !== '') {
                                                    var push = {
                                                        notification: {
                                                            body: text,
                                                            title: "Councils",
                                                            sound: "default",
                                                            icon: "icon"
                                                        },
                                                        content_available: true,
                                                        to: pushtkn,
                                                        priority: 'high'
                                                    };

                                                    options['body'] = JSON.stringify(push);

                                                    httpObj.post(url, JSON.stringify(push), options)
                                                        .subscribe(response => {
                                                            console.log('notification sent');
                                                        }, err => {
                                                            console.log('notification not sent, something went wrong');
                                                        });
                                                }

                                            }
                                        });
                                        return true; // to stop the loop.
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });
    }

    //Council Discussions Trigger ------------------------
    discussionsTrigger(discussionKey, discussion) {
        var httpObj = this.http;
        var discussionId = discussionKey;
        var description = discussion.topic;
        var createdBy = discussion.createdBy;
        var councilName = discussion.councilname;
        var userKeys = [];
        var notificationRef = firebase.database().ref().child('notifications').orderByChild('nodeid').equalTo(discussionId);
        notificationRef.once("value", function (snap) {
            if (!snap.exists()) {
                var councilUsersRef = firebase.database().ref().child('usercouncils').orderByChild('councilid').equalTo(discussion.councilid);
                councilUsersRef.once('value').then(function (usrsSnapshot) {
                    usrsSnapshot.forEach(usrObj => {
                        var id = usrObj.val()['userid'];
                        userKeys.push(id);
                        if (userKeys.indexOf(id) === userKeys.lastIndexOf(id)) {
                            var notSettingsRef = firebase.database().ref().child('notificationsettings').orderByChild('userid').equalTo(id);
                            notSettingsRef.once('value', function (notSnap) {
                                if (notSnap.exists()) {
                                    notSnap.forEach(notSetting => {
                                        if (notSetting.val()['allactivity'] === true || notSetting.val()['discussions'] === true) {
                                            var usrRef = firebase.database().ref().child('users/' + id);
                                            usrRef.once('value').then(function (usrSnapshot) {
                                                if (usrSnapshot.val()['isactive'] === true) {

                                                    var pushtkn = usrSnapshot.val()['pushtoken'];

                                                    firebase.database().ref().child('notifications').push({
                                                        userid: id,
                                                        nodeid: discussionId,
                                                        nodename: 'discussions',
                                                        description: description,
                                                        action: 'create',
                                                        text: description + ' created in ' + councilName,
                                                        createddate: new Date().toISOString(),
                                                        createdtime: new Date().toTimeString(),
                                                        createdby: createdBy,
                                                        isread: false
                                                    }).catch(err => {
                                                        throw err
                                                    });

                                                    if (pushtkn !== undefined && pushtkn !== '') {
                                                        var push = {
                                                            notification: {
                                                                body: description + ' created in ' + councilName,
                                                                title: "Councils",
                                                                sound: "default",
                                                                icon: "icon"
                                                            },
                                                            content_available: true,
                                                            to: pushtkn,
                                                            priority: 'high'
                                                        };

                                                        options['body'] = JSON.stringify(push);

                                                        httpObj.post(url, JSON.stringify(push), options)
                                                            .subscribe(response => {
                                                                console.log('notification sent');
                                                            }, err => {
                                                                console.log('notification not sent, something went wrong');
                                                            });
                                                    }
                                                }
                                            });
                                            return true; // to stop the loop.
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            }
        });

    }

    // Council Discussions Update Trigger ------------------------
    discussionsUpdateTrigger(msg, discussion) {
        //   if (discussion.isNotificationReq === true) {
        var httpObj = this.http;
        var description = discussion.topic;
        var userName = msg.user_firstname;
        var msg = msg.text;
        var userKeys = [];
        var councilUsersRef = firebase.database().ref().child('usercouncils').orderByChild('councilid').equalTo(discussion.councilid);
        councilUsersRef.once('value').then(function (usrsSnapshot) {
            usrsSnapshot.forEach(usrObj => {
                var id = usrObj.val()['userid'];
                userKeys.push(id);
                if (userKeys.indexOf(id) === userKeys.lastIndexOf(id)) {
                    var notSettingsRef = firebase.database().ref().child('notificationsettings').orderByChild('userid').equalTo(id);
                    notSettingsRef.once('value', function (notSnap) {
                        if (notSnap.exists()) {
                            notSnap.forEach(notSetting => {
                                if (notSetting.val()['allactivity'] === true || notSetting.val()['discussions'] === true) {
                                    var usrRef = firebase.database().ref().child('users/' + id);
                                    usrRef.once('value').then(function (usrSnapshot) {
                                        if (usrSnapshot.val()['isactive'] === true) {

                                            var pushtkn = usrSnapshot.val()['pushtoken'];

                                            if (pushtkn !== undefined && pushtkn !== '') {
                                                var push = {
                                                    notification: {
                                                        body: 'Council Discussion - ' + description + ' - @' + userName + ': ' + msg,
                                                        title: "Councils",
                                                        sound: "default",
                                                        icon: "icon"
                                                    },
                                                    content_available: true,
                                                    to: pushtkn,
                                                    priority: 'high'
                                                };

                                                options['body'] = JSON.stringify(push);

                                                httpObj.post(url, JSON.stringify(push), options)
                                                    .subscribe(response => {
                                                        console.log('notification sent');
                                                    }, err => {
                                                        console.log('notification not sent, something went wrong');
                                                    });
                                            }
                                        }
                                    });
                                    return true; // to stop the loop.
                                }
                            });
                        }
                    });
                }
            });
        });
        //  }
    }

    // Private Discussions Trigger ------------------------
    privateDiscussionsTrigger(pvtDiscussionKey, discussion) {
        var httpObj = this.http;
        var privateDiscussionId = pvtDiscussionKey;
        var description = discussion.createdUserName;
        var createdBy = discussion.createdUserId;
        var userId = discussion.otherUserId;

        var notificationRef = firebase.database().ref().child('notifications').orderByChild('nodeid').equalTo(privateDiscussionId);
        notificationRef.once("value", function (snap) {
            if (!snap.exists()) {
                var usrRef = firebase.database().ref().child('users/' + userId);
                usrRef.once('value').then(function (usrSnapshot) {
                    if (usrSnapshot.val()['isactive'] === true) {

                        var pushtkn = usrSnapshot.val()['pushtoken'];
                        var email = usrSnapshot.val()['email'];

                        var notSettingsRef = firebase.database().ref().child('notificationsettings').orderByChild('userid').equalTo(userId);
                        notSettingsRef.once('value', function (notSnap) {
                            if (notSnap.exists()) {
                                notSnap.forEach(notSetting => {
                                    if (notSetting.val()['allactivity'] === true || notSetting.val()['pvtdiscussions'] === true) {
                                        firebase.database().ref().child('notifications').push({
                                            userid: userId,
                                            nodeid: privateDiscussionId,
                                            nodename: 'privatediscussions',
                                            description: description,
                                            action: 'create',
                                            text: "<h3>" + "<span class='nottxt-lbl'>" + description + "</span>" + " private discussion invite" + "</h3>",
                                            createddate: new Date().toISOString(),
                                            createdtime: new Date().toTimeString(),
                                            createdby: createdBy,
                                            isread: false
                                        }).catch(err => {
                                            throw err
                                        });

                                        if (pushtkn !== undefined && pushtkn !== '') {
                                            var push = {
                                                notification: {
                                                    body: description + ' private discussion invite',
                                                    title: "Councils",
                                                    sound: "default",
                                                    icon: "icon"
                                                },
                                                content_available: true,
                                                to: pushtkn,
                                                priority: 'high'
                                            };

                                            options['body'] = JSON.stringify(push);

                                            httpObj.post(url, JSON.stringify(push), options)
                                                .subscribe(response => {
                                                    console.log('notification sent');
                                                }, err => {
                                                    console.log('notification not sent, something went wrong');
                                                });
                                        }

                                        return true; // to stop the loop.
                                    }
                                });
                            }
                        });

                    }
                });
            }
        });

    }

    // Private Discussions Update Trigger ------------------------
    privateDiscussionsUpdateTrigger(msg, discussion) {
        //if (snapshot.val()['isNotificationReq'] === true) {
        var httpObj = this.http;
        var description = msg.text;
        var email = '';
        var name = '';
        var id = '';

        if (msg.userId !== discussion.createdUserId) {
            email = discussion.createdUserEmail;
            name = discussion.otherUserName;
            id = discussion.createdUserId;
        } else if (msg.userId !== discussion.otherUserId) {
            email = discussion.otherUserEmail;
            name = discussion.createdUserName;
            id = discussion.otherUserId;
        }

        var usrRef = firebase.database().ref().child('users/' + id);
        usrRef.once('value').then(function (usrSnapshot) {
            if (usrSnapshot.val()['isactive'] === true) {

                var pushtkn = usrSnapshot.val()['pushtoken'];

                var notSettingsRef = firebase.database().ref().child('notificationsettings').orderByChild('userid').equalTo(id);
                notSettingsRef.once('value', function (notSnap) {
                    if (notSnap.exists()) {
                        notSnap.forEach(notSetting => {
                            if (notSetting.val()['allactivity'] === true || notSetting.val()['pvtdiscussions'] === true) {

                                if (pushtkn !== undefined && pushtkn !== '') {
                                    var push = {
                                        notification: {
                                            body: 'Private discussion - @' + name + ': ' + description,
                                            title: "Councils",
                                            sound: "default",
                                            icon: "icon"
                                        },
                                        content_available: true,
                                        to: pushtkn,
                                        priority: 'high'
                                    };

                                    options['body'] = JSON.stringify(push);

                                    httpObj.post(url, JSON.stringify(push), options)
                                        .subscribe(response => {
                                            console.log('notification sent');
                                        }, err => {
                                            console.log('notification not sent, something went wrong');
                                        });
                                }

                                return true; // to stop the loop.
                            }
                        });
                    }
                });
            }
        });
        // }
    }

    // User Update Trigger ------------------------
    userUpdateTrigger(userUid, action, tkn) {
        var httpObj = this.http;
        var notSettingsRef = firebase.database().ref().child('notificationsettings').orderByChild('userid').equalTo(userUid);
        notSettingsRef.once('value', function (notSnap) {
            if (notSnap.exists()) {
                notSnap.forEach(notSetting => {
                    if (notSetting.val()['allactivity'] === true || notSetting.val()['actinactaccount'] === true) {
                        // if (snapshot.val()['isnotificationreq'] === true) {

                        var description = '';

                        if (action === 'inactivate') {
                            description = 'Your account is deactivated'
                        } else if (action === 'activate') {
                            description = 'Your account is activated'
                        }

                        if (tkn !== undefined && tkn !== '') {
                            var push = {
                                notification: {
                                    body: description,
                                    title: "Councils",
                                    sound: "default",
                                    icon: "icon"
                                },
                                content_available: true,
                                to: tkn,
                                priority: 'high'
                            };

                            options['body'] = JSON.stringify(push);

                            httpObj.post(url, JSON.stringify(push), options)
                                .subscribe(response => {
                                    console.log('notification sent');
                                }, err => {
                                    console.log('notification not sent, something went wrong');
                                });
                        }
                        // }
                        return true; // to stop the loop.
                    }
                });
            }
        });
    }

    // Files Trigger ------------------------
    filesTrigger(fileKey, file) {
        var httpObj = this.http;
        var fileId = fileKey;
        var description = file.councilname;
        var createdBy = file.createdBy;
        var createdUser = file.createdUser;
        var name = file.filename;
        var userKeys = [];
        var notificationRef = firebase.database().ref().child('notifications').orderByChild('nodeid').equalTo(fileId);
        notificationRef.once("value", function (snap) {
            if (!snap.exists()) {
                var councilUsersRef = firebase.database().ref().child('usercouncils').orderByChild('councilid').equalTo(file.councilid);
                councilUsersRef.once('value').then(function (usrsSnapshot) {
                    usrsSnapshot.forEach(usrObj => {
                        var id = usrObj.val()['userid'];
                        userKeys.push(id);
                        if (userKeys.indexOf(id) === userKeys.lastIndexOf(id)) {
                            var notSettingsRef = firebase.database().ref().child('notificationsettings').orderByChild('userid').equalTo(id);
                            notSettingsRef.once('value', function (notSnap) {
                                if (notSnap.exists()) {
                                    notSnap.forEach(notSetting => {
                                        if (notSetting.val()['allactivity'] === true || notSetting.val()['files'] === true) {
                                            var usrRef = firebase.database().ref().child('users/' + id);
                                            usrRef.once('value').then(function (usrSnapshot) {
                                                if (usrSnapshot.val()['isactive'] === true) {

                                                    var pushtkn = usrSnapshot.val()['pushtoken'];
                                                    var txt = 'New ' + name + ' file uploaded';

                                                    firebase.database().ref().child('notifications').push({
                                                        userid: id,
                                                        nodeid: fileId,
                                                        nodename: 'files',
                                                        description: description,
                                                        action: 'create',
                                                        text: txt,
                                                        createddate: new Date().toISOString(),
                                                        createdtime: new Date().toTimeString(),
                                                        createdby: createdBy,
                                                        isread: false
                                                    }).catch(err => {
                                                        throw err
                                                    });

                                                    if (pushtkn !== undefined && pushtkn !== '') {
                                                        var push = {
                                                            notification: {
                                                                body: createdUser + ' sent you a file ' + name,
                                                                title: "Councils",
                                                                sound: "default",
                                                                icon: "icon"
                                                            },
                                                            content_available: true,
                                                            to: pushtkn,
                                                            priority: 'high'
                                                        };

                                                        options['body'] = JSON.stringify(push);

                                                        httpObj.post(url, JSON.stringify(push), options)
                                                            .subscribe(response => {
                                                                console.log('notification sent');
                                                            }, err => {
                                                                console.log('notification not sent, something went wrong');
                                                            });
                                                    }

                                                }
                                            });
                                            return true; // to stop the loop.
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            }
        });
    }

    // -----------------------------------------End Notifications --------------------------------------------------- //
}

