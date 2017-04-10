import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { AlertController, NavController, ActionSheetController, MenuController, ModalController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../../menu/menu';
import { NotesPage } from '../../notes/notes/notes';
import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    templateUrl: 'note.html',
    selector: 'note-page'
})
export class NotePage {

    noteKey = '';
    date = '';
    // createddate='';
    noteForm: FormGroup;
    createddate: '';

    constructor(navParams: NavParams, fb: FormBuilder,
        public firebaseservice: FirebaseService,
        public actionSheetCtrl: ActionSheetController,
        public alertCtrl: AlertController,
        public nav: NavController,
        public menuctrl: MenuController) {

        let note = navParams.get('notesSelected');
        this.date = note.createddate;
        this.noteKey = note.$key;

        let date = this.localISOformat(new Date());
        this.noteForm = fb.group({
            title: [note.title, Validators.required],
            note: [note.note, Validators.required],
            createdby: note.createdby,
            createddate: note.createddate,
        });
    }

    formatnoteObj(value) {
        return {
            title: value.title,
            note: value.note,
            createddate: new Date().toISOString(),
            createdby: value.createdby,

        }
    }
    save(value) {
        let formattedAgendaObj = this.formatnoteObj(value);
        this.firebaseservice.updateNote(formattedAgendaObj, this.noteKey)
            .then(res => { this.showAlert('Note has been updated.'); this.nav.push(NotesPage); })
            .catch(err => { this.showAlert('Unable to updated the Note, please try after some time.') })
    }

    delete() {
        this.firebaseservice.removeNote(this.noteKey)
            .then(res => { this.showAlert('Note has been deleted.'); this.nav.push(NotesPage); })
            .catch(err => { this.showAlert('Unable to delete the Note, please try after some time.') })
    }


    showAlert(errText) {
        let alert = this.alertCtrl.create({
            title: '',
            subTitle: errText,
            buttons: ['OK']
        });
        alert.present();
    }
    pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }
    localISOformat(date) {
        date = new Date(date);
        return date.getFullYear() +
            '-' + this.pad(date.getMonth() + 1) +
            '-' + this.pad(date.getDate()) +
            'T' + this.pad(date.getHours()) +
            ':' + this.pad(date.getMinutes()) +
            ':' + this.pad(date.getSeconds()) +
            '.' + (date.getMilliseconds() / 1000).toFixed(3).slice(2, 5) +
            'Z';
    };
    cancel() {
        this.nav.pop();
    }

}