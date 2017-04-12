import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppService } from '../../../providers/app-service';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { Observable } from 'rxjs/Observable';
import { WelcomePage } from '../../menu/menu';
import { NewNotePage } from '../../notes/newnote/newnote';
import { NotePage } from '../../notes/note/note';
import { Subject } from 'rxjs/Subject';

@Component({
    templateUrl: 'notes.html',
    selector: 'notes-page'
})
export class NotesPage {

    notesArray = [];
    count$ = new Subject();
    constructor(public nav: NavController, public as: AppService, public firebaseservice: FirebaseService) {
        var userId = localStorage.getItem('securityToken');
        if (userId !== null) {
            this.notesArray = [];
            this.firebaseservice.getNotes(userId).subscribe(notes => {
                this.notesArray = notes;
                this.count$.next(this.notesArray.length);
            });
        }
    }
    notesSelected(notesSelected) {
        this.nav.push(NotePage, { notesSelected: notesSelected });
    }

    getCount() {
        return this.count$;
    }

    cancel() {
        this.nav.setRoot(WelcomePage);
    }

}

