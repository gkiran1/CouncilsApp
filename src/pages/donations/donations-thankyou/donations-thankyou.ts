import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-donations-thankyou',
  templateUrl: 'donations-thankyou.html'
})
export class DonationsThankyouPage {

  constructor(public nav: NavController, public navParams: NavParams) { }

  ionViewDidLoad() {
  }
  cancel() {
    this.nav.popToRoot({ animate: true, animation: 'transition', direction: 'back' });
  }

}
