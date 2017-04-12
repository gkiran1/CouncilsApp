import { Component, ViewChild } from '@angular/core';
import { Nav, NavController } from 'ionic-angular';
import { DisplayPage } from '../display/display';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Subscription } from "rxjs";
import { Slides } from 'ionic-angular';
import * as firebase from 'firebase';

@Component({
  selector: 'page-welcome',
  templateUrl: 'menu.html'
})

export class WelcomePage{
  @ViewChild('switcher') switcher: Slides;
  //@ViewChild(Nav) nav: Nav;
  rootPage: any = DisplayPage;
  userObj: FirebaseObjectObservable<any>;
  userSubscription: Subscription;
  rootRef;

  constructor(public nav: NavController,
    public af: AngularFire,
    private firebaseService: FirebaseService
  ) {

    this.userObj = null;

    this.userSubscription = this.af.auth.subscribe(auth => {
      if (auth !== null) {

        //setting network status
        this.rootRef = firebase.database().ref();
        let amOnline = this.rootRef.child('.info/connected');
        let userRef = this.rootRef.child('/presence/' + auth.uid);
        amOnline.on('value', function (snapshot) {
          if (snapshot.val()) {
            userRef.onDisconnect().remove();
            userRef.set(true);
          }
        });

        this.firebaseService.getUsersByKey(auth.uid).subscribe(usrs => {
          this.userObj = usrs[0];
          localStorage.setItem('unitType', usrs[0].unittype);
          localStorage.setItem('unitNumber', usrs[0].unitnumber.toString());
          localStorage.setItem('userCouncils', usrs[0].councils.toString());
          localStorage.setItem('isAdmin', usrs[0].isadmin.toString());
        });
        this.firebaseService.getPrivateDiscussions().subscribe(discussions => {
          let privatediscussions = discussions.filter(discussion => {
            if (auth.uid === discussion.createdUserId || auth.uid === discussion.otherUserId) {
              return true;
            }
            return false;
          });
          privatediscussions.forEach(discussionEle => {
            this.firebaseService.getPrivateDiscussionByKey(discussionEle.$key).subscribe(discussion => {
              discussion.messages = discussion.messages || [];
              Object.keys(discussion.messages).forEach(e => {
                let message = discussion.messages[e];
                if (message.userId !== auth.uid && message.status === 'sent') {
                  this.firebaseService.updatePrivateDiscussionMessageStatus(discussion.$key, e, 'delivered')
                    .catch(err => {
                      console.log('Err:: open-council-discussion::', err);
                    });
                }
              });
            });
          });
        });
      };
    });
  }
  menuOpened() {

    this.switcher.update();
    if (localStorage.getItem('isMenuCentered') === '0') {
      localStorage.setItem('isMenuCentered', '1');
      setTimeout(() => {
        this.switcher.update();

        this.switcher.slideTo(1, 0);

      }, 300);
    }

  }

}