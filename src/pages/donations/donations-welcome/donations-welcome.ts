import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';

import { DonationsSendPage } from '../donations-send/donations-send';
import { NotificationsPage } from '../../notifications/notifications-page/notifications.component';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { NewMenuPage } from '../../newmenu/newmenu';
import { AngularFire } from 'angularfire2';
import { Http, Headers, RequestOptions } from '@angular/http';

@Component({
  selector: 'page-donations-welcome',
  templateUrl: 'donations-welcome.html'
})
export class DonationsWelcomePage {

  notificationsCount;
  user;
  unitnumber;
  nextPaymentDate;

  constructor(public loadingCtrl: LoadingController, public http: Http, public nav: NavController, public navParams: NavParams, public firebaseservice: FirebaseService, public af: AngularFire) {
    firebaseservice.getNotCnt().subscribe(count => {
      this.notificationsCount = count;
    });
    let uid = localStorage.getItem('securityToken');
    this.unitnumber = localStorage.getItem('unitNumber');
    if (uid) {
      this.af.database.object('/users/' + uid).subscribe(user => {
        this.user = user;
        if (user.isactivesubscriber) {
          this.firebaseservice.getFirebaseAuthTkn().then(tkn => {
            let headers = new Headers({ 'Content-Type': 'application/json', 'x-access-token': tkn, 'x-key': localStorage.getItem('securityToken') });
            let options = new RequestOptions({ headers: headers });

            this.http.post('https://councilsapi-165009.appspot.com/v1/nextpayment-date', { subscriptionid: user.subscriptionid }, options)
              .subscribe(response => {
                this.nextPaymentDate = response.json().nextPaymentDate * 1000; // converting from seconds to milliseconds
              }, err => {
                console.log(err);
              })
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
    let loader = this.loadingCtrl.create({
      spinner: 'hide',
      content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
    });
    loader.present();

    this.firebaseservice.getFirebaseAuthTkn().then(tkn => {
      let headers = new Headers({ 'Content-Type': 'application/json', 'x-access-token': tkn, 'x-key': localStorage.getItem('securityToken') });
      let options = new RequestOptions({ headers: headers });

      this.http.post('https://councilsapi-165009.appspot.com/v1/cancel-subscription', { subscriptionid: this.user.subscriptionid }, options)
        .subscribe(response => {
          console.log('Unsubscribed!');
          this.firebaseservice.updateSubscriptionInfo(localStorage.getItem('securityToken'), false, this.user.subscriptionid).then(res => {
            loader.dismiss();
          });
          this.nav.setRoot(this.nav.getActive().component);
        }, err => {
          loader.dismiss();
          console.log(err);
        })
    });
  }
}
