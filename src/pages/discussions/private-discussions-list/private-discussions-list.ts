import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenPrivateDiscussionPage } from '../open-private-discussion/open-private-discussion'
import { NavController } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
import { AngularFire } from 'angularfire2';
import { NotificationsPage } from '../../notifications/notifications-page/notifications.component';

@Component({
  templateUrl: 'private-discussions-list.html',
  selector: 'private-discussions-list-page'
})
export class PrivateDiscussionsListPage {
  discussions = [];
  count$ = new Subject();
  userSubscription: Subscription;
  uid;
  isListEmpty = false;
  notificationsCount;

  constructor(public af: AngularFire, public as: AppService, fs: FirebaseService, public nav: NavController) {
    if (localStorage.getItem('securityToken') !== null) {
      this.uid = localStorage.getItem('securityToken');
      this.discussions = [];
      fs.getPrivateDiscussions().subscribe(discussions => {
        this.discussions = discussions.filter(discussion => {
          if (this.uid === discussion.createdUserId || this.uid === discussion.otherUserId) {
            return true;
          }
          return false;
        });
        this.isListEmpty = this.discussions.length ? false : true;
        this.count$.next(this.discussions.length);
      });
    }

    fs.getNotCnt().subscribe(count => {
      this.notificationsCount = count;
    });

  }
  openDiscussion(discussion) {
    this.nav.push(OpenPrivateDiscussionPage, { discussion: discussion })
  }
  getCount() {
    return this.count$;
  }
  cancel() {
    this.nav.pop();
  }
  notificationsPage() {
    this.nav.push(NotificationsPage);
  }
}
