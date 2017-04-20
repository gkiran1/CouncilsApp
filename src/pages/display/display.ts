import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading, NavParams } from 'ionic-angular';
import { RegisterPage } from '../register/register';
import { AuthService } from '../../providers/auth-service';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { LoginPage } from '../login/login';
import { FirebaseService } from '../../environments/firebase/firebase-service'
import { AppService } from '../../providers/app-service';
import { Subject, Subscription } from 'rxjs';
import { NotificationsPage } from '../notifications/notifications-page/notifications.component';

@Component({
  selector: 'page-display',
  templateUrl: 'display.html'
})
export class DisplayPage {
  userName;
  registerCredentials = { email: '', ldsorgusername: '' };
  notifications;
  notificationsCount;
  count$ = new Subject();

  constructor(private navParams: NavParams,
    public appService: AppService,
    public firebaseService: FirebaseService,
    private nav: NavController) {
    this.registerCredentials.email = navParams.data.email;
    this.registerCredentials.ldsorgusername = navParams.data.ldsorgusername;

    firebaseService.getNotCnt().subscribe(count => {
      this.notificationsCount = count;
    });
  }

  notificationsPage() {
    this.nav.push(NotificationsPage);
  }

}
