import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenCouncilDiscussionPage } from '../open-council-discussion/open-council-discussion'
import { NavController } from 'ionic-angular';
import { Subject } from 'rxjs';
import { AngularFire } from 'angularfire2';
import { NotificationsPage } from '../../notifications/notifications-page/notifications.component';

@Component({
  templateUrl: 'council-discussions-list.html',
  selector: 'council-discussions-list-page'
})
export class CouncilDiscussionsListPage {
  discussions = [];
  count$ = new Subject();
  isListEmpty = false;
  notificationsCount;

  constructor(public af: AngularFire, public as: AppService, fs: FirebaseService, public nav: NavController) {
    let uid = localStorage.getItem('securityToken');
    if (uid !== null) {
      this.af.database.object('/users/' + uid).subscribe(usr => {
        this.discussions = [];
        fs.getDiscussions().subscribe(discussions => {
          this.discussions = discussions.filter(discussion => {
            return usr.councils.indexOf(discussion.councilid) !== -1;
          });
          this.isListEmpty = this.discussions.length ? false : true;
          let length = this.discussions.length;
          length = length ? length : null;
          this.count$.next(length);
        });
      });

    }

    fs.getNotCnt().subscribe(count => {
      this.notificationsCount = count;
    });

  }
  openDiscussion(discussion) {
    this.nav.push(OpenCouncilDiscussionPage, { discussion: discussion }, { animate: true, animation: 'transition', direction: 'forward' })
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
