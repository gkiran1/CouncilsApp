import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { DonationsSendPage } from '../donations-send/donations-send';
import { NotificationsPage } from '../../notifications/notifications-page/notifications.component';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { NewMenuPage } from '../../newmenu/newmenu';
import { NativeAudio } from '@ionic-native/native-audio';

@Component({
  selector: 'page-donations-welcome',
  templateUrl: 'donations-welcome.html'
})
export class DonationsWelcomePage {

  notificationsCount;

  constructor(public nav: NavController, public navParams: NavParams, public firebaseservice: FirebaseService, private nativeAudio: NativeAudio) {
    firebaseservice.getNotCnt().subscribe(count => {
      this.nativeAudio.play('chime');
      this.notificationsCount = count;
    });
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
}
