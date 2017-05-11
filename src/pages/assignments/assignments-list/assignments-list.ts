import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { Subject } from 'rxjs/Subject';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { NewAssignmentPage } from '../new-assignment/new-assignment';
import { User } from '../../../user/user';
import { Subscription } from "rxjs";
import { NotificationsPage } from '../../notifications/notifications-page/notifications.component';

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
  personalselectedIdx;
  councilselectedIdx;
  completedselectedIdx;
  notificationsCount;

  constructor(public navCtrl: NavController, public fs: FirebaseService, public af: AngularFire) {
    // // ***TODO*** 
    // let uid = localStorage.getItem('securityToken');
    //  this.af.database.object('/users/' + uid).subscribe(u => {
    //   let assignmentsArray = [];
    //   u.councils.forEach(councilId => {
    //     this.fs.getAssignmentsByCouncil(councilId).subscribe(assignments => {
    //       assignmentsArray.push(...assignments);
    //       this.count$.next(assignmentsArray.length);
    //     });
    //   });
    // });
    // // ***TODO ***
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
                if (!assignment.isactive) return;
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
              count = count ? count : null;
              this.count$.next(count);
            });
        })
      }
    });

    fs.getNotCnt().subscribe(count => {
      this.notificationsCount = count;
    });

  }

  getCount() {
    return this.count$;
  }

  assignmentSelected(assignment, index, type) {
    this.navCtrl.push(NewAssignmentPage, { assignment: assignment }, { animate: true, animation: 'transition', direction: 'forward' });
    if (type === 'council') {
      this.councilselectedIdx = index;
      this.personalselectedIdx = '';
      this.completedselectedIdx = '';
    } else if (type === 'completed') {
      this.completedselectedIdx = index;
      this.personalselectedIdx = '';
      this.councilselectedIdx = '';

    } else if (type === 'personal') {
      this.personalselectedIdx = index;
      this.councilselectedIdx = '';
      this.completedselectedIdx = '';
    }

  }
  cancel() {
    this.navCtrl.pop();
  }
  notificationsPage() {
    this.navCtrl.push(NotificationsPage);
  }
}