import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { NewAssignmentPage } from '../assignments/new-assignment/new-assignment';
import { NgZone } from '@angular/core';
import { AngularFire } from 'angularfire2';

@Component({
  templateUrl: 'slide3.html',
  selector: 'slide3'
})
export class slide3Page {
  activities;
  constructor(public af: AngularFire, public zone: NgZone, public nav: NavController, public fs: FirebaseService) {
    let uid = localStorage.getItem('securityToken');
    if (!uid) return; //Do nothing

    this.fs.getActivities(uid).subscribe(activities => {
      // activities.sort(function (a, b) { return (a.timestamp > b.timestamp) ? 1 : ((b.timestamp > a.timestamp) ? -1 : 0); });
      this.activities = activities.reverse();;
    });
  }

  showActivity(activity) {
    if (activity.entity === 'Assignment') {
      this.af.database.object('assignments/' + activity.entityid).take(1).subscribe(assignment => {
        this.zone.run(() => {
          this.nav.push(NewAssignmentPage, { assignment: assignment });
        });
      });
    }
  }

}

