import { Component } from '@angular/core';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenCouncilDiscussionPage } from '../open-council-discussion/open-council-discussion'
import { NavController } from 'ionic-angular';

@Component({
  templateUrl: 'council-discussions-list.html',
  selector: 'council-discussions-list-page'
})
export class CouncilDiscussionsListPage {
  discussions;
  constructor(fs: FirebaseService,public nav:NavController) {
    this.discussions = fs.getDiscussionsByCouncilId('-Kcx5MQFO8WhQEj94poP');
  }
  openDiscussion(discussion) {
    this.nav.push(OpenCouncilDiscussionPage,{discussion:discussion})
  }
}
