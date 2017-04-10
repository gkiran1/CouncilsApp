import { Component } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';
import { AlertController, NavController, ActionSheetController, MenuController, ModalController, NavParams } from 'ionic-angular';
import { WelcomePage } from '../../menu/menu';
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

        let date = this.localISOformat(new Date());
        this.newnoteForm = fb.group({
            title: ['', Validators.required],
            note: ['', Validators.required],
            createdby: localStorage.getItem('securityToken'),
            createddate: new Date().toDateString(),
        });
    }

    createNote(note) {
        this.firebaseservice.createNote(note)
            .then(res => {
                this.showAlert('Note created successfully.');
                this.nav.push(WelcomePage)
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