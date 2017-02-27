
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { Subject } from 'rxjs/Subject';
import { AngularFire } from 'angularfire2';

@Component({
  templateUrl: 'council-assignments.html',
  selector: 'council-assignments'
})
export class CouncilAssignmentsPage {
  user;
  councilAssignmentsArray = [];
  subject = new Subject();
  constructor(public navCtrl: NavController, public as: AppService, public fs: FirebaseService, public af: AngularFire) {
    this.user = as.getUser();
    this.user.subscribe(user => {
      console.log('user councils:', user.councils);
      this.councilAssignmentsArray = [];
      // user.councils.forEach(council => {
      //   fs.getAssignmentsByCouncil(council).subscribe(councils => {
      //     this.councilAssignmentsArray.push(...councils);
      //     this.subject.next(this.councilAssignmentsArray.length);
      //     console.log(' this.councilAssignmentsArray:', council, this.councilAssignmentsArray, this.councilAssignmentsArray.length);
      //   });
      // });
      af.database.list('/assignments').map(assignments => {
        const v = assignments.filter(assignment => {
          return user.councils.includes(assignment.councilid);
        })
        return v;
      }).subscribe(assignments => {
        this.councilAssignmentsArray = assignments;
        this.subject.next(this.councilAssignmentsArray.length);
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
