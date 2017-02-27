import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { ThanksFeedbackPage } from '../thanks-feedback/thanks-feedback';

@Component({
    selector: 'submit-feedback',
    templateUrl: 'submit-feedback.html',
    providers: [FirebaseService]
})

export class SubmitFeedbackPage {

    public feedback: string;

    constructor(public navCtrl: NavController, private ser: FirebaseService) {
    }

    submitFeedback() {
        this.ser.saveFeedback(this.feedback, 'user1', Date.now());
        this.navCtrl.push(ThanksFeedbackPage);
    }

}
