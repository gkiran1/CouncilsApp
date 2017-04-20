import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { AlertController, NavController, ActionSheetController, MenuController, ModalController, NavParams } from 'ionic-angular';

import * as moment from 'moment';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

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
        public menuctrl: MenuController) {

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
                this.showAlert('Note created successfully.');
                this.nav.popToRoot();
            })
            .catch(err => this.showAlert(err))
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

    cancel() {
        this.nav.pop();
    }
}