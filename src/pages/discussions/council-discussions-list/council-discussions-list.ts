import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenCouncilDiscussionPage } from '../open-council-discussion/open-council-discussion'
import { NavController } from 'ionic-angular';
import { Subject } from 'rxjs/Subject';

@Component({
  templateUrl: 'council-discussions-list.html',
  selector: 'council-discussions-list-page'
})
export class CouncilDiscussionsListPage {
  discussions;
  count$ = new Subject();
  isListEmpty = false;
  constructor(fs: FirebaseService, public nav: NavController) {
    if (localStorage.getItem('userCouncils')) {
      let councilsIds = localStorage.getItem('userCouncils').split(',');
      fs.getDiscussions().subscribe(discussions => {
        this.discussions = discussions.filter(discussion => {
          return councilsIds.indexOf(discussion.councilid) !== -1;
        });
        this.isListEmpty = this.discussions.length ? false : true;
        this.count$.next(this.discussions.length);
      });
    }
  }
  openDiscussion(discussion) {
    this.nav.push(OpenCouncilDiscussionPage, { discussion: discussion })
  }
  getCount() {
    return this.count$;
  }
}


