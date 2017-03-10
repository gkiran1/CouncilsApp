import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { OpenCouncilDiscussionPage } from '../open-council-discussion/open-council-discussion';
import * as moment from 'moment';

@Component({
  templateUrl: 'new-council-discussion.html',
  selector: 'new-council-discussion-page'
})
export class NewCouncilDiscussionPage {
  newCouncilDiscussionForm: FormGroup;
  councils;
  constructor(fb: FormBuilder, public appservice: AppService, public firebaseservice: FirebaseService, public nav: NavController) {
    appservice.getUser().subscribe(user => {
      this.councils = [];
      user.councils.forEach(c => {
        this.councils.push(this.firebaseservice.getCouncilByCouncilKey(c));
      });
    });
    this.newCouncilDiscussionForm = fb.group({
      topic: ['', Validators.compose([Validators.required,Validators.maxLength(25)])],
      councilid: ['', Validators.required],
      createdDate: '',
      createdBy: appservice.uid,
      isActive: true
    });

  }
  create(value) {
    value.createdDate = moment().toISOString();
    console.log('create method', value);
    // this.firebaseservice.createDiscussion(value)
    // .then(res=>{
    //   console.log(res);
    // })
    // .catch(err=>{
    //   console.log(err);
    //   alert(err);
    // })
    this.nav.push(OpenCouncilDiscussionPage,{
      discussion:value
    });
  }
  cancel() {
    this.nav.pop();
  }
}
