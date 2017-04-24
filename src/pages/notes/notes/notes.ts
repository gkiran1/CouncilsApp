import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { Observable } from 'rxjs/Observable';
import { NewNotePage } from '../../notes/newnote/newnote';
import { NotePage } from '../../notes/note/note';
import { Subject } from 'rxjs/Subject';
import { NotificationsPage } from '../../notifications/notifications-page/notifications.component';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';

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
                    this.notesArray = notes;
                    let length = this.notesArray.length;
                    length = length ? length : null;
                    this.count$.next(length);
                });
            }
        });

        // var userId = localStorage.getItem('securityToken');
        // if (userId !== null) {
        //     this.notesArray = [];
        //     this.firebaseservice.getNotes(userId).subscribe(notes => {
        //         this.notesArray = notes;
        //         let length = this.notesArray.length;
        //         length = length ? length : null;
        //         this.count$.next(length);
        //     });
        // }

        firebaseservice.getNotCnt().subscribe(count => {
            this.notificationsCount = count;
        });
    }

    notesSelected(notesSelected) {
        this.nav.push(NotePage, { notesSelected: notesSelected });
    }

    getCount() {
        return this.count$;
    }

    notificationsPage() {
        this.nav.push(NotificationsPage);
    }
}

