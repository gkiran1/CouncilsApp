import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-donations-thankyou',
  templateUrl: 'donations-thankyou.html'
})
export class DonationsThankyouPage {

  constructor(public nav: NavController, public navParams: NavParams) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DonationsThankyouPage');
  }
  cancel() {
    this.nav.popToRoot();
  }

}
