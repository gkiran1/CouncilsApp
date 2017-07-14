import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DisplayPage } from '../../display/display'

@Component({
    selector: 'thanks-feedback',
    templateUrl: 'thanks-feedback.html'
})

export class ThanksFeedbackPage {

    constructor(public navCtrl: NavController, public navParams: NavParams) { }

    goToHome() {
        this.navCtrl.setRoot(DisplayPage);
    }
    cancel() {
        this.navCtrl.popToRoot();

    }

}
