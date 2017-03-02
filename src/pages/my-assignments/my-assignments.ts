import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Component({
    templateUrl: 'my-assignments.html',
    selector: 'my-assignments'
})
export class MyAssignmentsPage {
    user;
    myAssignments;
    subject = new Subject();
    constructor(public navCtrl: NavController, public as: AppService, public fs: FirebaseService) {
        this.user = as.getUser();
        this.myAssignments = fs.getAssignmentsByUserKey(as.uid);
        this.myAssignments.subscribe(a => { this.subject.next(a.length) });
    }

    getCount() {
        return this.subject;
    }

  selectedIdx;
  mydate = new Date();
  assignmentSelected(assignment, index) {
    this.selectedIdx = index;
    console.log('assignmentSelected', assignment);
  }
}