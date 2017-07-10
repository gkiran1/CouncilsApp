import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FirebaseService } from '../../environments/firebase/firebase-service'
import { AppService } from '../../providers/app-service';
import { Subject } from 'rxjs';
import { NotificationsPage } from '../notifications/notifications-page/notifications.component';
import { NewMenuPage } from '../newmenu/newmenu';
import { NativeAudio } from '@ionic-native/native-audio';
import { Badge } from '@ionic-native/badge';

@Component({
  selector: 'page-display-first',
  templateUrl: 'display-first.html'
})
export class DisplayFirstPage {
  userName;
  registerCredentials = { email: '', ldsorgusername: '' };
  notifications;
  notificationsCount;
  count$ = new Subject();
  // buttonClicked = true;

  constructor(private navParams: NavParams,
    public appService: AppService,
    public firebaseService: FirebaseService,
    private nav: NavController, private nativeAudio: NativeAudio,
    public badge:Badge) {
    this.registerCredentials.email = navParams.data.email;
    this.registerCredentials.ldsorgusername = navParams.data.ldsorgusername;
   
    firebaseService.getNotCnt().subscribe(count => {

      this.notificationsCount = count;
      this.badge.set(this.notificationsCount);

      if (localStorage.getItem('NotificationsCount') === '') {
        localStorage.setItem('NotificationsCount', this.notificationsCount);
      }
      if (localStorage.getItem('NotificationsCount') !== this.notificationsCount.toString()) {
        this.nativeAudio.play('chime');
        localStorage.setItem('NotificationsCount', this.notificationsCount);
       
      }   

    });
  }

  notificationsPage() {
    this.nav.push(NewMenuPage);
  } 

}