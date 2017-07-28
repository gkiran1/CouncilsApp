import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { ThanksFeedbackPage } from '../thanks-feedback/thanks-feedback';
import { AppService } from '../../../providers/app-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';

@Component({
    selector: 'submit-feedback',
    templateUrl: 'submit-feedback.html',
    providers: [FirebaseService, AppService]
})

export class SubmitFeedbackPage {

    // public feedback: string;

    newFeedbackForm: FormGroup;
    isValidTopic = true;

    constructor(public navCtrl: NavController, fb: FormBuilder, private ser: FirebaseService, private appSer: AppService) {

        this.newFeedbackForm = fb.group({
            feedbacktopic: ['', Validators.required],
            describe: ['', Validators.required],
            createdby: localStorage.getItem('securityToken'),
            createddate: '',
        });
    }

    submitFeedback(feedback) {
        feedback.createddate = moment().toISOString();
        this.ser.saveFeedback(feedback);
        this.navCtrl.push(ThanksFeedbackPage);
    }

    back() {
        this.navCtrl.pop({ animate: true, animation: 'transition', direction: 'back' });

    }

    keypressed($event) {
        $event.target.value.trim() === '' ? this.isValidTopic = false : this.isValidTopic = true;
        if ($event.target.value.length > 25) {
            return false;
        }
    }
}
