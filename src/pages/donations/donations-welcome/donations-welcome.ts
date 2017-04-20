import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../../menu/menu';
import { DonationsSendPage } from '../donations-send/donations-send';
import { NotificationsPage } from '../../notifications/notifications-page/notifications.component';
import { FirebaseService } from '../../../environments/firebase/firebase-service';

@Component({
  selector: 'page-donations-welcome',
  templateUrl: 'donations-welcome.html'
})
export class DonationsWelcomePage {

  notificationsCount;

  constructor(public nav: NavController, public navParams: NavParams, public firebaseservice: FirebaseService) {
    firebaseservice.getNotCnt().subscribe(count => {
      this.notificationsCount = count;
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DonationsWelcomePage');
  }
  sendDonationsPage() {
    this.nav.push(DonationsSendPage);
  }
  cancel() {
    this.nav.setRoot(WelcomePage);
  }
  notificationsPage() {
    this.nav.push(NotificationsPage);
  }
}
