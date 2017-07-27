import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenPrivateDiscussionPage } from '../open-private-discussion/open-private-discussion';
import * as moment from 'moment';
import { AngularFire } from 'angularfire2';

@Component({
  templateUrl: 'new-private-discussion.html',
  selector: 'new-private-discussion-page'
})
export class NewPrivateDiscussionPage {
  NewPrivateDiscussionForm: FormGroup;
  users = [];
  term: string = '';
  isLoading = true;
  uid;
  constructor(public af: AngularFire, fb: FormBuilder, public firebaseservice: FirebaseService, public nav: NavController) {
    this.af.auth.subscribe(auth => {
      if (auth !== null) {
        this.af.database.object('/users/' + auth.uid).subscribe(user => {
          this.uid = auth.uid;
          user.councils.forEach(councilid => {
            this.firebaseservice.getUsersByCouncil(councilid).subscribe(uc => {
              uc.forEach(e => {
                this.firebaseservice.getUsersByKey(e.userid).subscribe(u => {
                  if (u[0] && u[0].isactive) {
                    let v = this.users.some(i => {
                      return i.$key === u[0].$key;
                    });
                    u[0].councilsString = '';
                    u[0].councils.forEach(c => {
                      this.firebaseservice.getCouncilByCouncilKey(c).subscribe(council => {
                        u[0].councilsString = `${u[0].councilsString}${u[0].councilsString ? ',' : ''} ${council.council}`;
                      });
                    });
                    if (!v) {
                      this.users.push(u[0]);
                      this.isLoading = false;
                    }
                  }
                });
              });
            });
          })

          // this.firebaseservice.getUsers().subscribe(users => {
          //   this.users = users.filter(e => {
          //     return e.councils.some(c => {
          //       return user.councils.indexOf(c) !== -1;
          //     });
          //   });
          //   this.isLoading = false;
          // });

          this.NewPrivateDiscussionForm = fb.group({
            otherUser: ['', Validators.required],
            createdDate: '',
            createdUserId: this.uid,
            createdUserName: user.firstname + ' ' + user.lastname,
            createdUserAvatar: user.avatar,
            createdUserEmail: user.email,
            isActive: true,
            messages: [],
            lastMsg: '',
            isNotificationReq: false
          });
        });
      }
    });

  }
  create(value) {
    value.otherUserId = value.otherUser.$key;
    value.otherUserName = value.otherUser.firstname + ' ' + value.otherUser.lastname;
    value.otherUserAvatar = value.otherUser.avatar;
    value.createdDate = moment().toISOString();
    value.typings = '';

    this.firebaseservice.createPrivateDiscussion(value)
      .then(discussionId => {
        this.nav.push(OpenPrivateDiscussionPage, {
          discussion: discussionId
        });
      })
      .catch(err => {
        alert(err);
      })

  }
  cancel() {
    this.nav.pop();
  }
  searchFn(event) {
    this.term = event.target.value;
  }
}
