import { Component } from '@angular/core';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { NavController, ToastController, NavParams } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { InviteAdminSuccessPage } from './success.component';
import { Http } from '@angular/http';
import { EmailService } from '../../providers/emailservice'
import { LoadingControllerService } from '../../services/LoadingControllerService';
import { NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { validateEmail } from '../../custom-validators/custom-validator';

@Component({
    templateUrl: 'invite-admin.html',
    selector: 'invite-admin-page',
    providers: [EmailService]
})

export class InviteAdminPage {
    invite = { email: '', firstname: '', lastname: '' };
    isValidEmail = true;
    emailErr = true;
    radioSelected;
    adminname;
    unitType;
    inviteadminForm: FormGroup;
    heading;
    constructor(fb: FormBuilder,
        public http: Http,
        public navctrl: NavController,
        public fs: FirebaseService,
        public toast: ToastController,
        public emailService: EmailService,
        public loaderService: LoadingControllerService,
        private zone: NgZone, public navParams: NavParams) {
        this.adminname = localStorage.getItem('name');
        this.unitType = localStorage.getItem('unitType');

        this.heading = navParams.get('heading');

        this.inviteadminForm = fb.group({
            email: ['', Validators.compose([Validators.required, validateEmail])],
            firstname: ['', Validators.required],
            lastname: ['', Validators.required],
            radioSelected: ['', Validators.required],
        });

        this.inviteadminForm.valueChanges.subscribe(data => {
            this.zone.run(() => {
                this.radioSelected = data.radioSelected;
            });
        });

    }

    inviteMember(value) {
        let loader = this.loaderService.getLoadingController();
        loader.present();

        this.emailErr = false;

        this.emailService.inviteAdminEmail(value.firstname + " " + value.lastname, value.email, this.adminname)
            .then(res => {
                res.subscribe(result => {
                    if (result.status === 200) {
                        loader.dismiss();
                        this.navctrl.push(InviteAdminSuccessPage)
                    } else {
                        loader.dismiss();
                        this.showAlert('Connection error.');
                    }
                });
            }, err => {
                loader.dismiss();
                this.showAlert('Connection error.');
            }).catch(err => {
                console.log('err ---> ', err);
                loader.dismiss();
                this.showAlert('Connection error.');
            });
    }

    showAlert(errText) {
        let toast = this.toast.create({
            message: errText,
            duration: 3000,
            position: 'top'
        });
        toast.present();
    }

    close() {
        this.navctrl.pop({ animate: true, animation: 'transition', direction: 'back' });
    }

}