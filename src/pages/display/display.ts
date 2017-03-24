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

@Component({
  selector: 'page-display',
  templateUrl: 'display.html'
})
export class DisplayPage {
  // @ViewChild(Nav) nav: Nav;
  //rootPage = LoginPage;
  //displaypage:DisplayPage;
  userName;
  registerCredentials = { email: '', ldsorgusername: '' };
  notifications;
  notificationsCount;
  count$ = new Subject();

  constructor(private navParams: NavParams, public appService: AppService, public firebaseService: FirebaseService) {
    this.registerCredentials.email = navParams.data.email;
    this.registerCredentials.ldsorgusername = navParams.data.ldsorgusername;

    var userId = localStorage.getItem('securityToken');

    if (userId !== null) {
      this.notifications = [];
      this.firebaseService.getNotifications(userId).subscribe(notifications => {
        this.notifications = notifications.filter(notification => {
          return notification.isread === false;
        });
        console.log('this.notifications', this.notifications);
        this.count$.next(this.notifications.length);
        this.notificationsCount = this.count$;
      });
    }

  }


  click() {
    // setTimeout(() => {
    //     this.userName = this.firebaseService.usr.firstname;
    //   },50000);
    // this.userName = this.appService.user.firstname;
    // console.log('click', this.userName);
  }

  notificationsPage() {

  }

}
