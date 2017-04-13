import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { InAppBrowser } from 'ionic-native';

@Component({
    selector: 'googlecalender-page',
    templateUrl: 'googlecalender.html'
})

export class GoogleCalenderPage {

    CLIENT_ID = '114459908471-4jqdmftgt7k6dfbiav7nhtuoo4l95p5l.apps.googleusercontent.com';
    SCOPES = ["https://www.googleapis.com/auth/calendar"];
    APIKEY = "AIzaSyACyvOLh2dcuJv1am2fmlnnQfhGKXkuROI";
    REDIRECTURL = "http://localhost/callback";

    constructor(public navCtrl: NavController, public navParams: NavParams) {
        // InAppBrowser.open('https://accounts.google.com/o/oauth2/auth?suppress_webview_warning=true&client_id='
        //     + this.CLIENT_ID + '&redirect_uri=' + this.REDIRECTURL + '&scope=https://www.googleapis.com/auth/calendar&approval_prompt=force&response_type=token', '_blank', 'location=no');
    }

}
