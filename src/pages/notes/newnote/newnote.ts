import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { AlertController, NavController, ActionSheetController, MenuController, NavParams, ToastController} from 'ionic-angular';

import * as moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotesPage } from '../notes/notes'

@Component({
    templateUrl: 'newnote.html',
    selector: 'newnote-page'
})
export class NewNotePage {

    newnoteForm: FormGroup;

    constructor(navParams: NavParams, fb: FormBuilder,
        public firebaseservice: FirebaseService,
        public actionSheetCtrl: ActionSheetController,
        public alertCtrl: AlertController,
        public nav: NavController,
        public menuctrl: MenuController,
        public toast: ToastController) {

        this.newnoteForm = fb.group({
            title: ['', Validators.required],
            note: ['', Validators.required],
            createdby: localStorage.getItem('securityToken'),
            createddate: '',
        });
    }

    createNote(note) {
        note.createddate = moment().toISOString();
        this.firebaseservice.createNote(note)
            .then(res => {
                this.nav.setRoot(NotesPage);
            })
            .catch(err => this.showAlert('Connection error.'))
    }

    showAlert(errText) {
        // let alert = this.alertCtrl.create({
        //     title: '',
        //     subTitle: errText,
        //     buttons: ['OK']
        // });
        // alert.present();

        let toast = this.toast.create({
            message: errText,
            duration: 3000
        })

        toast.present();
    }
    pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    cancel() {
        this.nav.pop();
    }
}