import { Component } from '@angular/core';
import { NavController,NavParams } from 'ionic-angular';
// import { FormBuilder,  Validators } from '@angular/forms';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';


@Component({
  templateUrl: 'open-council-discussion.html'
})
export class OpenCouncilDiscussionPage {
    title = '';
    constructor(public navparams:NavParams){
        this.title = navparams.get('title');
    }
}
