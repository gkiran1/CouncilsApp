import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenPrivateDiscussionPage } from '../open-private-discussion/open-private-discussion'
import { NavController } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
import { AngularFire } from 'angularfire2';

@Component({
  templateUrl: 'private-discussions-list.html',
  selector: 'private-discussions-list-page'
})
export class PrivateDiscussionsListPage {
  discussions;
  subject = new Subject();
  userSubscription: Subscription;
  uid;
  constructor(public af: AngularFire, public as: AppService, fs: FirebaseService, public nav: NavController) {
    this.userSubscription = this.af.auth.subscribe(auth => {
      if (auth !== null) {
        this.as.getUser().subscribe(user => {
          this.uid = user.$key;
          this.discussions = [];
          fs.getPrivateDiscussions().subscribe(discussions => {
            this.discussions = discussions.filter(discussion => {
              if (user.$key === discussion.createdUserId || user.$key === discussion.otherUserId) {
                return true;
              }
              return false;
            });
            this.subject.next(this.discussions.length);
          });
        });
      }
    });
  }
  openDiscussion(discussion) {
    this.nav.push(OpenPrivateDiscussionPage, { discussion: discussion })
  }
  getCount() {
    return this.subject;
  }
}
