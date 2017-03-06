import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Subject } from 'rxjs/Subject';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { NewAssignmentPage } from '../new-assignment/new-assignment';
import { User } from '../../user/user';
import { Subscription } from "rxjs";

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
  userSubscription: Subscription;
  selectedIdx;

  constructor(public navCtrl: NavController, public fs: FirebaseService, public af: AngularFire) {
    this.userSubscription = this.af.auth.subscribe(auth => {
      this.af.database.object('/users/' + auth.uid).subscribe(usr => {
        this.user = usr;
        af.database.list('/assignments')
          .subscribe(assignments => {
            const councilAssignments = assignments.filter(assignment => {
              return this.user.councils.includes(assignment.councilid);
            });

            const personalAssignment = assignments.filter(assignment => {
              return assignment.assignedto === auth.uid;
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
      })

    });
  }

  getCount() {
    return this.subject;
  }

  assignmentSelected(assignment, index) {
    this.navCtrl.push(NewAssignmentPage, { assignment: assignment });
    this.selectedIdx = index;
    console.log('assignmentSelected', assignment);
  }

}