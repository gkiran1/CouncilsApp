import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FirebaseService } from '../../environments/firebase/firebase-service'
import { AppService } from '../../providers/app-service';
import { Subject } from 'rxjs';
import { NotificationsPage } from '../notifications/notifications-page/notifications.component';
import { NewMenuPage } from '../newmenu/newmenu';

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
    this.nav.push(NewMenuPage);
  }

}
