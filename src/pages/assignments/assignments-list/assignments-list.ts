import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { Subject } from 'rxjs/Subject';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { NewAssignmentPage } from '../new-assignment/new-assignment';
import { User } from '../../../user/user';
import { Subscription } from "rxjs";

@Component({
  templateUrl: 'assignments-list.html',
  selector: 'assignments-list'
})

export class AssignmentsListPage {
  user;
  councilAssignmentsArray = [];
  personalAssignmentsArray = [];
  completedAssignmentsArray = [];
  count$ = new Subject();
  userSubscription: Subscription;
  selectedIdx;

  constructor(public navCtrl: NavController, public fs: FirebaseService, public af: AngularFire) {
    this.userSubscription = this.af.auth.subscribe(auth => {
      if (auth !== null) {
        this.af.database.object('/users/' + auth.uid).subscribe(usr => {
          this.user = usr;
          af.database.list('/assignments')
            .subscribe(assignments => {
              this.councilAssignmentsArray = [];
              this.personalAssignmentsArray = [];
              this.completedAssignmentsArray = [];
              assignments.forEach(assignment => {
                if (assignment.assignedto === this.user.$key) {
                  if (assignment.isCompleted) {
                    this.completedAssignmentsArray.push(assignment);
                  } else {
                    this.personalAssignmentsArray.push(assignment);
                  }

                } else if (this.user.councils.includes(assignment.councilid)) {
                  if (assignment.isCompleted) {
                    this.completedAssignmentsArray.push(assignment);
                  } else {
                    this.councilAssignmentsArray.push(assignment);
                  }
                }
              });

              // this.councilAssignmentsArray = assignments;
              let count = this.personalAssignmentsArray.length + this.councilAssignmentsArray.length + this.completedAssignmentsArray.length;
              this.count$.next(count);
            });
        })
      }
    });
  }

  getCount() {
    return this.count$;
  }

  assignmentSelected(assignment, index) {
    this.navCtrl.push(NewAssignmentPage, { assignment: assignment });
    this.selectedIdx = index;
    console.log('assignmentSelected', assignment);
  }
  cancel() {
    this.navCtrl.pop();
  }
}