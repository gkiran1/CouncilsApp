import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { DonationsSendPage } from '../donations-send/donations-send';
import { NotificationsPage } from '../../notifications/notifications-page/notifications.component';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { NewMenuPage } from '../../newmenu/newmenu';
import { AngularFire } from 'angularfire2';
import { Http } from '@angular/http';

@Component({
  selector: 'page-donations-welcome',
  templateUrl: 'donations-welcome.html'
})
export class DonationsWelcomePage {

  notificationsCount;
  user;
  unitnumber;
  nextPaymentDate;

  constructor(public http: Http, public nav: NavController, public navParams: NavParams, public firebaseservice: FirebaseService, public af: AngularFire) {
    firebaseservice.getNotCnt().subscribe(count => {
      this.notificationsCount = count;
    });
    let uid = localStorage.getItem('securityToken');
    this.unitnumber = localStorage.getItem('unitNumber');
    if (uid) {
      this.af.database.object('/users/' + uid).subscribe(user => {
        this.user = user;
        if (user.isactivesubscriber) {
          this.http.post('https://councilsapi-165009.appspot.com/nextpayment-date', { subscriptionid: user.subscriptionid }).subscribe(response => {
            this.nextPaymentDate = response.json().nextPaymentDate * 1000; // converting from seconds to milliseconds
          }, error => {
            throw error;
          });
        }
      });
    }
  }

  ionViewDidLoad() {
  }
  sendDonationsPage() {
    this.nav.push(DonationsSendPage);
  }
  cancel() {
    this.nav.pop();
  }
  notificationsPage() {
    this.nav.push(NewMenuPage);
  }

  cancelSubscription() {

  }
}
