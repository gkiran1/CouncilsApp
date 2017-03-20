import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenPrivateDiscussionPage } from '../open-private-discussion/open-private-discussion'
import { NavController } from 'ionic-angular';
import { Subject } from 'rxjs/Subject';

@Component({
  templateUrl: 'private-discussions-list.html',
  selector: 'private-discussions-list-page'
})
export class PrivateDiscussionsListPage {
  discussions;
  count$ = new Subject();
  loggedInUserKey;
  constructor(fs: FirebaseService, public nav: NavController) {
    this.loggedInUserKey = localStorage.getItem('securityToken');
    fs.getPrivateDiscussions().subscribe(discussions => {
      this.discussions = discussions.filter(discussion => {
        if (this.loggedInUserKey === discussion.createdUserId || this.loggedInUserKey === discussion.otherUserId) {
          return true;
        }
        return false;
      });
      this.count$.next(this.discussions.length);
    });

  }
  openDiscussion(discussion) {
    this.nav.push(OpenPrivateDiscussionPage, { discussion: discussion })
  }
  getCount() {
    return this.count$;
  }
}
