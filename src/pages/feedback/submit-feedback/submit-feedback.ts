import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { ThanksFeedbackPage } from '../thanks-feedback/thanks-feedback';
import { AppService } from '../../../providers/app-service';

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
        this.navCtrl.pop({ animate: true, animation: 'transition', direction: 'back' });

    }

}
