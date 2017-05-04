import { Component, ElementRef } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { AlertController, NavController, ActionSheetController, MenuController,  NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
        public menuctrl: MenuController,
        public elementRef: ElementRef) {

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
            .then(res => {
                this.nav.popToRoot();
            })
            .catch(err => { this.showAlert('Unable to update the Note, please try after some time.') })
    }

    delete() {
        this.firebaseservice.removeNote(this.noteKey)
            .then(res => { this.nav.pop(); })
            .catch(err => { this.showAlert('Unable to delete the Note, please try after some time.') })
    }

    showConfirm() {
        let confirm = this.alertCtrl.create({
            title: 'Are you sure you want to delete?',
            // message: 'Do you agree to use this lightsaber to do good across the intergalactic galaxy?',
            buttons: [
                {
                    text: 'Yes',
                    handler: () => {
                        this.delete();
                    }
                },
                {
                    text: 'No',
                    handler: () => {
                        console.log('Disagree clicked');
                    }
                }
            ]
        });
        confirm.present();
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
        this.nav.pop({ animate: true, animation: 'transition', direction: 'back' });
    }

    ionViewDidLoad() {
        let textarea = this.elementRef.nativeElement.querySelector('textarea');
        textarea.style.overflow = 'hidden';
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + "px";
    }
}