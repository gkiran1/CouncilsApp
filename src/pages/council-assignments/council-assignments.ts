
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Subject } from 'rxjs/Subject';
import { AngularFire } from 'angularfire2';
import { NewAssignmentPage } from '../new-assignment/new-assignment';

@Component({
  templateUrl: 'council-assignments.html',
  selector: 'council-assignments'
})
export class CouncilAssignmentsPage {
  user;
  councilAssignmentsArray = [];
  completedAssignmentsArray = [];
  personalAssignmentArray = [];
  subject = new Subject();
  constructor(public navCtrl: NavController, public as: AppService, public fs: FirebaseService, public af: AngularFire) {
    this.user = as.getUser();
    this.user.subscribe(user => {
      console.log('user councils:', user.councils);
      //this.councilAssignmentsArray = [];
      // user.councils.forEach(council => {
      //   fs.getAssignmentsByCouncil(council).subscribe(councils => {
      //     this.councilAssignmentsArray.push(...councils);
      //     this.subject.next(this.councilAssignmentsArray.length);
      //     console.log(' this.councilAssignmentsArray:', council, this.councilAssignmentsArray, this.councilAssignmentsArray.length);
      //   });
      // });
      af.database.list('/assignments')
        .subscribe(assignments => {
          const councilAssignments = assignments.filter(assignment => {
            return user.councils.includes(assignment.councilid);
          });

          const personalAssignment = assignments.filter(assignment => {
            return assignment.assignedto === as.uid;
          });

          this.councilAssignmentsArray = [];
          this.completedAssignmentsArray = [];
          this.personalAssignmentArray = [];

          councilAssignments.forEach(e => {
            if (e.isCompleted) {
              this.completedAssignmentsArray.push(e);
            } else {
              this.councilAssignmentsArray.push(e);
            }
          });

          personalAssignment.forEach(e => {
            if (e.isCompleted) {
              this.completedAssignmentsArray.push(e);
            } else {
              this.personalAssignmentArray.push(e);
            }
          });

          // this.councilAssignmentsArray = assignments;
          this.subject.next(this.councilAssignmentsArray.length + this.personalAssignmentArray.length + this.completedAssignmentsArray.length);
        });
    });
  }
  getCount() {
    return this.subject;
  }
  selectedIdx;
  assignmentSelected(assignment, index) {
    this.navCtrl.push(NewAssignmentPage, { assignment: assignment });
    this.selectedIdx = index;
    console.log('assignmentSelected', assignment);
  }

}
