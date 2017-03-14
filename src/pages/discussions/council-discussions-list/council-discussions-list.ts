import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenCouncilDiscussionPage } from '../open-council-discussion/open-council-discussion'
import { NavController } from 'ionic-angular';
import { Subject, Subscription } from 'rxjs';
import { AngularFire } from 'angularfire2';

@Component({
  templateUrl: 'council-discussions-list.html',
  selector: 'council-discussions-list-page'
})
export class CouncilDiscussionsListPage {
  discussions;
  subject = new Subject();
  userSubscription: Subscription;
  constructor(public af: AngularFire, public as: AppService, fs: FirebaseService, public nav: NavController) {
    this.userSubscription = this.af.auth.subscribe(auth => {
      if (auth !== null) {
        this.as.getUser().subscribe(user => {
          this.discussions = [];
          fs.getDiscussions().subscribe(discussions => {
            this.discussions = discussions.filter(discussion => {
              return user.councils.indexOf(discussion.councilid) !== 0;
            });
            this.subject.next(this.discussions.length);
          });
        });
      }
    });
  }
  openDiscussion(discussion) {
    this.nav.push(OpenCouncilDiscussionPage, { discussion: discussion })
  }
  getCount() {
    return this.subject;
  }
}
