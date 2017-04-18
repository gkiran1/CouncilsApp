import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { NewAssignmentPage } from '../assignments/new-assignment/new-assignment';
import { NgZone } from '@angular/core';
import { AngularFire } from 'angularfire2';
import { AgendaEditPage } from '../agenda-edit/agenda-edit';
import { AgendaLiteEditPage } from '../agenda-lite-edit/agenda-lite-edit';
import { OpenCouncilDiscussionPage } from '../discussions/open-council-discussion/open-council-discussion';

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
    } else if (activity.entity === 'Discussion') {

      this.nav.push(OpenCouncilDiscussionPage, { discussion: activity.entityid });

    } else if (activity.entity === 'Agenda Standard') {
      this.af.database.object('agendas/' + activity.entityid).take(1).subscribe(agenda => {
        this.zone.run(() => {
          this.nav.push(AgendaEditPage, { agendaselected: agenda });
        });
      });
    } else if (activity.entity === 'Agenda Lite') {
      this.af.database.object('agendas/' + activity.entityid).take(1).subscribe(agenda => {
        this.zone.run(() => {
          this.nav.push(AgendaLiteEditPage, { agendaselected: agenda });
        });
      });
    }
  }

}

