import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenPrivateDiscussionPage } from '../open-private-discussion/open-private-discussion'
import { NavController } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
import { AngularFire } from 'angularfire2';
import { NotificationsPage } from '../../notifications/notifications-page/notifications.component';
import { NewMenuPage } from '../../newmenu/newmenu';
import { NativeAudio } from '@ionic-native/native-audio';

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

  constructor(public af: AngularFire, public as: AppService, fs: FirebaseService, public nav: NavController, private nativeAudio: NativeAudio) {
    if (localStorage.getItem('securityToken') !== null) {
      this.uid = localStorage.getItem('securityToken');
      this.discussions = [];
      fs.getPrivateDiscussions().subscribe(discussions => {
        this.discussions = discussions.filter(discussion => {
          if (this.uid === discussion.createdUserId || this.uid === discussion.otherUserId) {
            return true;
          }
          return false;
        }).sort(function (a, b) {
          return (a.createdDate > b.createdDate) ? -1 : ((b.createdDate > a.createdDate) ? 1 : 0);
        });

        this.isListEmpty = this.discussions.length ? false : true;
        let length = this.discussions.length;
        length = length ? length : null;
        this.count$.next(length);
      });
    }

    fs.getNotCnt().subscribe(count => {
      this.nativeAudio.play('chime');
      this.notificationsCount = count;
    });

  }
  openDiscussion(discussion) {
    this.nav.push(OpenPrivateDiscussionPage, { discussion: discussion }, { animate: true, animation: 'transition', direction: 'forward' });
  }
  getCount() {
    return this.count$;
  }
  cancel() {
    this.nav.pop();
  }
  notificationsPage() {
    this.nav.push(NewMenuPage);
  }
}
