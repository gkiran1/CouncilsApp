import { Component } from '@angular/core';
import { Invitee } from './invitee.model';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { AlertController, NavController, LoadingController, ToastController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { InviteAdminSuccessPage } from './success.component';
import { Http } from '@angular/http';
import { EmailService } from '../../providers/emailservice'
import { LoadingControllerService } from '../../services/LoadingControllerService';

@Component({
    templateUrl: 'invite-admin.html',
    selector: 'invite-admin-page',
    providers: [EmailService]
})

export class InviteAdminPage {
    invite = { email: '', firstname: '', lastname: '' };
    isValidEmail = true;
    emailErr = false;
    adminname;
    unitType;
    areaType = false;
    stkType = false;

    constructor(public http: Http,
        public navctrl: NavController,
        public fs: FirebaseService,
        public toast: ToastController,
        public emailService: EmailService,
        public loaderService: LoadingControllerService) {
        this.adminname = localStorage.getItem('name');
        this.unitType = localStorage.getItem('unitType');
    }

    keypresssed($event) {
        this.emailErr = false;
        if ((new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test($event.target.value))) {
            this.isValidEmail = true;
        }
        else {
            this.isValidEmail = false;
        }
    }

    inviteMember() {
        let loader = this.loaderService.getLoadingController();
        loader.present();

        this.emailErr = false;

        this.emailService.inviteAdminEmail(this.invite.firstname + " " + this.invite.lastname, this.invite.email, this.adminname)
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