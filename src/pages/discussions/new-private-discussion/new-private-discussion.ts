import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenPrivateDiscussionPage } from '../open-private-discussion/open-private-discussion';
import * as moment from 'moment';

@Component({
  templateUrl: 'new-private-discussion.html',
  selector: 'new-private-discussion-page'
})
export class NewPrivateDiscussionPage {
  NewPrivateDiscussionForm: FormGroup;
  users;
  term: string = '';
  constructor(fb: FormBuilder, public appservice: AppService, public firebaseservice: FirebaseService, public nav: NavController) {
    appservice.getUser().subscribe(user => {
      this.firebaseservice.getUsers().subscribe(u => {
        this.users = u.filter(e => {
          return e.councils.some(c => {
            return user.councils.indexOf(c) !== -1;
          });
        });
      });
      this.NewPrivateDiscussionForm = fb.group({
        otherUser: '',
        createdDate: '',
        createdUserId: appservice.uid,
        createdUserName: user.firstname + ' ' + user.lastname,
        isActive: true,
        messages: []
      });
    });
  }
  create(value) {
    value.otherUserId = value.otherUser.$key;
    value.otherUserName = value.otherUser.firstname + ' ' + value.otherUser.lastname;
    value.createdDate = moment().toISOString();
    console.log('NewPrivateDiscussionForm------------>', value);

    this.firebaseservice.createPrivateDiscussion(value)
      .then(discussionId => {
        console.log("discussion created successfully...", discussionId);
        this.nav.push(OpenPrivateDiscussionPage, {
          discussion: discussionId
        });
      })
      .catch(err => {
        console.log(err);
        alert(err);
      })

  }
  cancel() {
    this.nav.pop();
  }
  searchFn(event) {
    this.term = event.target.value;
    console.log('search', event.target.value);
  }
}
