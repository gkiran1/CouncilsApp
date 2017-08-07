import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenCouncilDiscussionPage } from '../open-council-discussion/open-council-discussion';
import * as moment from 'moment';
import { AngularFire } from 'angularfire2';

@Component({
  templateUrl: 'new-council-discussion.html',
  selector: 'new-council-discussion-page'
})
export class NewCouncilDiscussionPage {
  newCouncilDiscussionForm: FormGroup;
  //councils;
  areaCouncils = []
  stakeCouncils = [];
  wardCouncils = [];
  addedCouncils = [];

  firstShown;
  isValidTopic = false;

  constructor(navParams: NavParams, public af: AngularFire, fb: FormBuilder, public appservice: AppService, public firebaseservice: FirebaseService, public nav: NavController) {
    let topicitem = navParams.get('item');
    var unitType = localStorage.getItem('unitType');

    this.af.auth.subscribe(auth => {
      if (auth !== null) {
        this.af.database.object('/users/' + auth.uid).subscribe(user => {
          //this.councils = [];
          user.councils.forEach(c => {
            this.firebaseservice.getCouncilByCouncilKey(c).subscribe(council => {

              if (unitType === 'Area') {
                if (council['under'] === 'Added') {
                  this.addedCouncils.push(council);
                }
                else if (council['council'] === 'Stake Presidents') {
                  this.stakeCouncils.push(council);
                }
                else {
                  this.areaCouncils.push(council);
                }
              }
              else if (unitType === 'Stake') {
                if (council['under'] === 'Added') {
                  this.addedCouncils.push(council);
                }
                else if (council['council'] === 'Stake Presidents') {
                  this.areaCouncils.push(council);
                }
                else if (council['council'] === 'Bishops') {
                  this.wardCouncils.push(council);
                }
                else {
                  this.stakeCouncils.push(council);
                }
              }
              else if (unitType === 'Ward') {
                if (council['under'] === 'Added') {
                  this.addedCouncils.push(council);
                }
                else if (council['council'] === 'Bishops') {
                  this.stakeCouncils.push(council);
                }
                else {
                  this.wardCouncils.push(council);
                }
              }

              if (this.areaCouncils.length > 0) {
                this.firstShown = 'Area';
              }
              else if (this.stakeCouncils.length > 0) {
                this.firstShown = 'Stake';
              }
              else if (this.wardCouncils.length > 0) {
                this.firstShown = 'Ward';
              }
              else if (this.addedCouncils.length > 0) {
                this.firstShown = 'Added';
              }

            });
          });
          topicitem && (topicitem.trim() === '') ? this.isValidTopic = false : this.isValidTopic = true;
          this.newCouncilDiscussionForm = fb.group({
            topic: [topicitem ? topicitem : '', Validators.compose([Validators.required, Validators.maxLength(25)])],
            council: ['', Validators.required],
            createdDate: '',
            createdBy: appservice.uid,
            createdUser: user.firstname + ' ' + user.lastname,
            isActive: true,
            messages: [],
            councilname: '',
            isNotificationReq: false,
            lastMsgSentUser: ''
          });
        });
      }
    });
  }
  create(value) {
    value.createdDate = moment().toISOString();
    value.councilid = value.council.$key;
    value.councilname = value.council.council;
    value.lastMsg = '';
    value.typings = '';
    this.firebaseservice.createDiscussion(value)
      .then(discussionId => {
        this.nav.push(OpenCouncilDiscussionPage, {
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

  keypressed($event) {
    $event.target.value.trim() === '' ? this.isValidTopic = false : this.isValidTopic = true;
    if ($event.target.value.length > 25) {
      return false;
    }
  }

}
