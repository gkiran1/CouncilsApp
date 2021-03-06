import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../../menu/menu';

@Component({
    selector: 'thanks-feedback',
    templateUrl: 'thanks-feedback.html'
})

export class ThanksFeedbackPage {

    constructor(public navCtrl: NavController, public navParams: NavParams) { }

    goToHome() {
        this.navCtrl.push(WelcomePage);
    }
     cancel() {
      this.navCtrl.pop();
    }

}
