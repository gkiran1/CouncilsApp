
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Subject } from 'rxjs/Subject';

@Component({
  templateUrl: 'council-assignments.html',
  selector:'council-assignments'
})
export class CouncilAssignmentsPage {
  user;
  myAssignments;
  councilAssignmentsArray = [];
  subject = new Subject();
  constructor(public navCtrl: NavController, public as: AppService, public fs: FirebaseService) {
    this.user = as.getUser();
    this.myAssignments = fs.getAssignmentsByUserKey(as.uid);
    this.user.subscribe(user => {
      console.log('user councils:', user.councils);
       this.councilAssignmentsArray = [];
      user.councils.forEach(council => {
        fs.getAssignmentsByCouncil(council).subscribe(councils => {
          this.councilAssignmentsArray.push(...councils);
          this.subject.next(this.councilAssignmentsArray.length);
          console.log(' this.councilAssignmentsArray:', council, this.councilAssignmentsArray, this.councilAssignmentsArray.length);
        });
      });
    });
  }
  getCount() {
    return this.subject;
  }
  selectedIdx;
  assignmentSelected(assignment, index) {
    this.selectedIdx = index;
    console.log('assignmentSelected', assignment);
  }

}
