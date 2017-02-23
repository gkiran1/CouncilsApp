import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
// import { FormBuilder,  Validators } from '@angular/forms';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import {OpenCouncilDiscussionPage} from './open-council-discussion';

@Component({
  templateUrl: 'new-council-discussion.html'
})
export class NewCouncilDiscussionPage {
  // discussion = {
  //   topic: '',
  //   councils: ''
  // }
  // councils;
  // constructor(public appservice: AppService, public firebaseservice: FirebaseService, public nav:NavController) {
  //   appservice.getUser().subscribe(user => {
  //     this.firebaseservice.getCouncilsByKey(user.unittype).subscribe(councils => {
  //       this.councils = councils;
  //     });
  //   });
  // }
  // create() {
  //   console.log('create method');
  //   this.nav.push(OpenCouncilDiscussionPage,{
  //     title:this.discussion.topic
  //   });
  // }
  // sample(){
  //   console.log('sample method');
  // }
}
