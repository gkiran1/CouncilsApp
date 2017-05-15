import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { NotePage } from '../../notes/note/note';
import { Subject } from 'rxjs/Subject';
import { NotificationsPage } from '../../notifications/notifications-page/notifications.component';
import { AngularFire } from 'angularfire2';

@Component({
    templateUrl: 'notes.html',
    selector: 'notes-page'
})
export class NotesPage {

    notesArray = [];
    count$ = new Subject();
    notificationsCount;
    userSubscription;

    constructor(public nav: NavController, public af: AngularFire, public as: AppService, public firebaseservice: FirebaseService) {

        this.userSubscription = this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.notesArray = [];
                this.firebaseservice.getNotes(auth.uid).subscribe(notes => {

                    notes.sort(function (a, b) {
                        return (a.createddate > b.createddate) ? -1 : ((a.createddate < b.createddate) ? 1 : 0);
                    });

                    this.notesArray = notes;
                    let length = this.notesArray.length;
                    length = length ? length : null;
                    this.count$.next(length);
                });
            }
        });

        firebaseservice.getNotCnt().subscribe(count => {
            this.notificationsCount = count;
        });
    }

    notesSelected(notesSelected) {
        this.nav.push(NotePage, { notesSelected: notesSelected }, { animate: true, animation: 'transition', direction: 'back' });
    }

    getCount() {
        return this.count$;
    }

    notificationsPage() {
        this.nav.push(NotificationsPage);
    }
}

