import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { InAppBrowser } from 'ionic-native';
import * as firebase from 'firebase';

@Component({
    selector: 'googlecalender-page',
    templateUrl: 'googlecalender.html'
})

export class GoogleCalenderPage {

    rootRef: any;

    CLIENT_ID = '114459908471-4jqdmftgt7k6dfbiav7nhtuoo4l95p5l.apps.googleusercontent.com';
    SCOPES = ["https://www.googleapis.com/auth/calendar"];
    APIKEY = "AIzaSyACyvOLh2dcuJv1am2fmlnnQfhGKXkuROI";
    REDIRECTURL = "http://localhost/callback";

    constructor(public navCtrl: NavController, public navParams: NavParams) {
        this.rootRef = firebase.database().ref();
        var apiKey = this.APIKEY;
        var tkn;

        var browserRef = cordova.InAppBrowser.open('https://accounts.google.com/o/oauth2/auth?suppress_webview_warning=true&client_id='
            + this.CLIENT_ID + '&redirect_uri=' + this.REDIRECTURL
            + '&scope=https://www.googleapis.com/auth/calendar&approval_prompt=force&response_type=token', '_blank', 'location=no');

        browserRef.addEventListener('loadstart', function (event) {
            if ((event.url).startsWith("http://localhost/callback")) {
                var url = event["url"];
                var token = url.split('access_token=')[1].split('&token_type')[0];
                tkn = token;
                browserRef.removeEventListener("exit", (event) => { });
                browserRef.close();
            }
        });

        //////////////////////////

        this.rootRef.child('agendas').endAt().limitToLast(1).on('child_added', function (snapshot) {
            var councilId = snapshot.val()['councilid'];
            var createdDate = snapshot.val()['agendadate'];
            var councils = localStorage.getItem('userCouncils').split(',')

            if (councils.indexOf(councilId) !== -1) {
                //Sending the google calendar invite from the google api
                gapi.client.setApiKey(apiKey);

                alert('testingAgendas')

                var request = gapi.client.request({
                    'path': '/calendar/v3/calendars/primary/events?alt=json',
                    'method': 'POST',
                    'headers': {
                        'Authorization': 'Bearer ' + tkn
                    },
                    'body': JSON.stringify({
                        "summary": 'Agendas',
                        "location": 'Test',
                        "description": 'New Agenda',
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
                            alert("Invitation sent successfully");
                        } else {
                            alert("Failed to sent invite.");
                        }
                        console.log(jsonR);
                    }
                });
            }
        });

        //////////////////////////

        this.rootRef.child('assignments').endAt().limitToLast(1).on('child_added', function (snapshot) {
            var councilId = snapshot.val()['councilid'];
            var createdDate = snapshot.val()['assigneddate'];
            var councils = localStorage.getItem('userCouncils').split(',');

            if (councils.indexOf(councilId) !== -1) {
                //Sending the google calendar invite from the google api
                gapi.client.setApiKey(apiKey);

                alert('testingAssignments')

                var request = gapi.client.request({
                    'path': '/calendar/v3/calendars/primary/events?alt=json',
                    'method': 'POST',
                    'headers': {
                        'Authorization': 'Bearer ' + tkn
                    },
                    'body': JSON.stringify({
                        "summary": 'Assignments',
                        "location": 'Test',
                        "description": 'New Assignment',
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
                            alert("Invitation sent successfully");
                        } else {
                            alert("Failed to sent invite.");
                        }
                        console.log(jsonR);
                    }
                });
            }
        });


    }

    back() {
        this.navCtrl.pop();
    }

}