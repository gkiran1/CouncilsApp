import { Component, ViewChild } from '@angular/core';
import { NavController, ActionSheetController, MenuController } from 'ionic-angular';
import { InactivateMembersPage } from '../inactivatemembers/inactivate-members/inactivatemembers.component';
import { ReactivateMembersPage } from '../reactivatemembers/reactivate-members/reactivatemembers.component';
import { TransferAdminRightsPage } from '../transferadminrights/transfer-adminrights/transferadminrights.component';
import { InviteMemberPage } from '../invite/invite';
import { ActiveCouncilsPage } from '../activecouncils/activecouncils';
import { NewCouncilPage } from '../new-council/new-council';
import { EditProfilePage } from '../edit-profile/edit-profile';
import { SubmitFeedbackPage } from '../feedback/submit-feedback/submit-feedback';
import { AboutPage } from '../about/about';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AgendasPage } from '../agendas/agendas';
import { AssignmentsListPage } from '../assignments/assignments-list/assignments-list';
import { Subscription } from "rxjs";
import { GoodbyePage } from '../goodbye/goodbye';
import { NotificationSettingsPage } from '../notifications/notifications-settings/notificationsettings.component';
import { GoogleCalenderPage } from '../googlecalender/googlecalender.component';
import { NotificationsPage } from '../notifications/notifications-page/notifications.component';
import * as firebase from 'firebase';

@Component({
    selector: 'settings-page',
    templateUrl: 'settings.html',
    providers: [AssignmentsListPage, ActiveCouncilsPage]

})

export class SettingsPage {
    // userSubscription: Subscription;
    notificationsCount;

    constructor(private navCtrl: NavController,
        public appService: AppService,
        public assignmentsListPage: AssignmentsListPage,
        public activeCouncilsPage: ActiveCouncilsPage,
        private firebaseService: FirebaseService) {
        firebaseService.getNotCnt().subscribe(count => {
            this.notificationsCount = count;
        });
    }

    viewEditProfilePage() {
        this.navCtrl.push(EditProfilePage);
    }
    viewNotificationSettingsPage() {
        this.navCtrl.push(NotificationSettingsPage);
    }
    viewFeedbackPage() {
        this.navCtrl.push(SubmitFeedbackPage);
    }
    viewAboutUSPage() {
        this.navCtrl.push(AboutPage);
    }
    viewGoogleCalenderPage() {
        this.googleCalendar();
    }
    signOut() {
        this.appService.userSubscription.unsubscribe();
        //  this.userSubscription.unsubscribe();
        this.assignmentsListPage.userSubscription.unsubscribe();
        this.activeCouncilsPage.userSubscription.unsubscribe();
        localStorage.setItem('securityToken', null);
        localStorage.setItem('isUserLoggedIn', 'false');
        localStorage.setItem('isMenuCentered', '0');
        this.firebaseService.signOut().then(() => {
            console.log('Sign Out successfully..');
            this.navCtrl.setRoot(GoodbyePage);
        }).catch(err => {
            this.navCtrl.setRoot(GoodbyePage);
            alert(err);
        })
    }
    back() {
        //this.navCtrl.setRoot(WelcomePage);
    }
    notificationsPage() {
        this.navCtrl.push(NotificationsPage);
    }

    rootRef: any;
    btnClicked: any;

    CLIENT_ID = '114459908471-4jqdmftgt7k6dfbiav7nhtuoo4l95p5l.apps.googleusercontent.com';
    SCOPES = ["https://www.googleapis.com/auth/calendar"];
    APIKEY = "AIzaSyACyvOLh2dcuJv1am2fmlnnQfhGKXkuROI";
    REDIRECTURL = "http://localhost/callback";

    googleCalendar() {
        this.rootRef = firebase.database().ref();
        var apiKey = this.APIKEY;

        var browserRef = cordova.InAppBrowser.open('https://accounts.google.com/o/oauth2/auth?suppress_webview_warning=true&client_id='
            + this.CLIENT_ID + '&redirect_uri=' + this.REDIRECTURL
            + '&scope=https://www.googleapis.com/auth/calendar&approval_prompt=force&response_type=token', '_blank', 'location=no');

        browserRef.addEventListener('loadstart', function (event) {
            console.log('eventurl', event.url);
            if ((event["url"]).indexOf("http://localhost/callback") >= 0 && (event["url"]).indexOf("access_token=") >= 0) {
                var url = event["url"];
                var token = url.split('access_token=')[1].split('&token_type')[0];
                localStorage.setItem('allowed', 'true');
                localStorage.setItem('gcToken', token);
                browserRef.removeEventListener("exit", (event) => { });
                browserRef.close();
            }
            else if ((event["url"]).indexOf("http://localhost/callback#error=access_denied") >= 0) {
                firebase.database().ref().child('users/' + localStorage.getItem('securityToken')).update({ googlecalendaradded: false });
                localStorage.setItem('allowed', 'false');
                browserRef.removeEventListener("exit", (event) => { });
                browserRef.close();
            }
        });

        this.sendInvite();

    }
    sendInvite() {
        var apiKey = this.APIKEY;

        if (this.rootRef === undefined) {
            this.rootRef = firebase.database().ref();
        }

        if (localStorage.getItem('childAdded') !== 'true' && localStorage.getItem('allowed') === 'true') {

            localStorage.setItem('childAdded', 'true');

            this.rootRef.child('agendas').endAt().limitToLast(1).on('child_added', function (snapshot) {

                var agendaId = snapshot.getKey();
                var councilId = snapshot.val()['councilid'];
                var createdDate = snapshot.val()['agendadate'];
                var councils = localStorage.getItem('userCouncils').split(',');

                //if (localStorage.getItem('allowed') === 'true') {

                firebase.database().ref().child('users/' + localStorage.getItem('securityToken')).update({ googlecalendaradded: true });

                if (councils.indexOf(councilId) !== -1) {

                    var calendarRef = firebase.database().ref().child('calendarinvites').orderByChild('nodeid').equalTo(agendaId);

                    calendarRef.once("value", function (snap) {

                        if (!snap.exists()) {

                            //Sending the google calendar invite from the google api
                            gapi.client.setApiKey(apiKey);

                            firebase.database().ref().child('calendarinvites').push({
                                nodeid: agendaId,
                                item: "Agenda",
                                nodename: 'agendas',
                                createddate: new Date().toISOString(),
                                createdtime: new Date().toTimeString(),
                                userrecievedid: localStorage.getItem('securityToken')
                            }).catch(err => { throw err });

                            var request = gapi.client.request({
                                'path': '/calendar/v3/calendars/primary/events?alt=json',
                                'method': 'POST',
                                'headers': {
                                    'Authorization': 'Bearer ' + localStorage.getItem('gcToken')
                                },
                                'body': JSON.stringify({
                                    "summary": 'Agendas',
                                    "location": 'New Agenda',
                                    "description": 'New Agenda has been created',
                                    "start": {
                                        "dateTime": createdDate,
                                        "timeZone": "Asia/Kolkata"
                                    },
                                    "end": {
                                        "dateTime": createdDate,
                                        "timeZone": "Asia/Kolkata" // TODO : Parameterize this timezone
                                    },
                                    "reminders": {
                                        "useDefault": false,
                                        "overrides": [
                                            {
                                                "method": "email",
                                                "minutes": 1440
                                            },
                                            {
                                                "method": "popup",
                                                "minutes": 10
                                            }
                                        ]
                                    }
                                }),
                                'callback': function (jsonR, rawR) {
                                    if (jsonR.id) {
                                        //  alert("Invitation sent successfully for Agendas");
                                    }
                                    console.log(jsonR);
                                }
                            });
                        }
                    });
                }
                // }
            });

            //////////////////////////

            this.rootRef.child('assignments').endAt().limitToLast(1).on('child_added', function (snapshot) {

                var assignmentId = snapshot.getKey();
                var councilId = snapshot.val()['councilid'];
                var createdDate = snapshot.val()['assigneddate'];
                var councils = localStorage.getItem('userCouncils').split(',');

                // if (localStorage.getItem('allowed') === 'true') {

                firebase.database().ref().child('users/' + localStorage.getItem('securityToken')).update({ googlecalendaradded: true })

                if (councils.indexOf(councilId) !== -1) {

                    var calendarRef = firebase.database().ref().child('calendarinvites').orderByChild('nodeid').equalTo(assignmentId);

                    calendarRef.once("value", function (snap) {

                        if (!snap.exists()) {

                            firebase.database().ref().child('calendarinvites').push({
                                nodeid: assignmentId,
                                item: "Assignment",
                                nodename: 'assignments',
                                createddate: new Date().toISOString(),
                                createdtime: new Date().toTimeString(),
                                userrecievedid: localStorage.getItem('securityToken')
                            }).catch(err => { throw err });

                            //Sending the google calendar invite from the google api
                            gapi.client.setApiKey(apiKey);

                            var request = gapi.client.request({
                                'path': '/calendar/v3/calendars/primary/events?alt=json',
                                'method': 'POST',
                                'headers': {
                                    'Authorization': 'Bearer ' + localStorage.getItem('gcToken')
                                },
                                'body': JSON.stringify({
                                    "summary": 'Assignments',
                                    "location": 'New Assignment',
                                    "description": 'New Assignment has been created',
                                    "start": {
                                        "dateTime": createdDate,
                                        "timeZone": "Asia/Kolkata"
                                    },
                                    "end": {
                                        "dateTime": createdDate,
                                        "timeZone": "Asia/Kolkata" // TODO : Parameterize this timezone
                                    },
                                    "reminders": {
                                        "useDefault": false,
                                        "overrides": [
                                            {
                                                "method": "email",
                                                "minutes": 1440
                                            },
                                            {
                                                "method": "popup",
                                                "minutes": 10
                                            }
                                        ]
                                    }
                                }),
                                'callback': function (jsonR, rawR) {
                                    if (jsonR.id) {
                                        //  alert("Invitation sent successfully for Assignments");
                                    }
                                    console.log(jsonR);
                                }
                            });
                        }
                    });
                }
                // }
            });


        }


    }
}