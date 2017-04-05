import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../../menu/menu';
import { DonationsSendPage } from '../donations-send/donations-send';

@Component({
  selector: 'page-donations-welcome',
  templateUrl: 'donations-welcome.html'
})
export class DonationsWelcomePage {

  constructor(public nav: NavController, public navParams: NavParams) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DonationsWelcomePage');
  }
  sendDonationsPage() {
    this.nav.push(DonationsSendPage);
  }
  cancel() {
    this.nav.setRoot(WelcomePage);
  }

}
