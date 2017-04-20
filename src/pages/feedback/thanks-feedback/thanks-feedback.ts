import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
    selector: 'thanks-feedback',
    templateUrl: 'thanks-feedback.html'
})

export class ThanksFeedbackPage {

    constructor(public navCtrl: NavController, public navParams: NavParams) { }

    goToHome() {
        this.navCtrl.popToRoot();
    }
     cancel() {
      this.navCtrl.pop();
    }

}
