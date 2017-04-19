import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenCouncilDiscussionPage } from '../open-council-discussion/open-council-discussion'
import { NavController } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
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
    if (localStorage.getItem('userCouncils') !== null) {
      var councilsIds = localStorage.getItem('userCouncils').split(',');
      this.discussions = [];
      fs.getDiscussions().subscribe(discussions => {
        this.discussions = discussions.filter(discussion => {
          //console.log('user.councils, discussion.councilid',councilsIds, discussion.councilid);
          return councilsIds.indexOf(discussion.councilid) !== -1;
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
    this.nav.push(OpenCouncilDiscussionPage, { discussion: discussion })
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
