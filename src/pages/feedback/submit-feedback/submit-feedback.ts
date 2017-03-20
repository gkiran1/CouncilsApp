import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { ThanksFeedbackPage } from '../thanks-feedback/thanks-feedback';
import { AppService } from '../../../providers/app-service';
import { SettingsPage } from '../../settings/settings';

@Component({
    selector: 'submit-feedback',
    templateUrl: 'submit-feedback.html',
    providers: [FirebaseService, AppService]
})

export class SubmitFeedbackPage {

    public feedback: string;

    constructor(public navCtrl: NavController, private ser: FirebaseService, private appSer: AppService) {
    }

    submitFeedback() {
        this.ser.saveFeedback(this.feedback, this.appSer.uid, new Date().toDateString());
        this.navCtrl.push(ThanksFeedbackPage);
    }

    back() {
        this.navCtrl.setRoot(SettingsPage);
    }

}
