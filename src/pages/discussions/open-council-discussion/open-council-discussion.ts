import { Component } from '@angular/core';
import { NavController,NavParams } from 'ionic-angular';
// import { FormBuilder,  Validators } from '@angular/forms';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';


@Component({
  templateUrl: 'open-council-discussion.html'
})
export class OpenCouncilDiscussionPage {
    discussion;
    constructor(public navparams:NavParams){
        this.discussion = navparams.get('discussion');
        console.log('discussion in open',this.discussion);
    }
}
