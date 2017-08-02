import { Component } from '@angular/core';
import { Invitee } from './invitee.model';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { AlertController, NavController, LoadingController, ToastController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { InviteAdminSuccessPage } from './success.component';
import { Http } from '@angular/http';
import { EmailService } from '../../providers/emailservice'

@Component({
    templateUrl: 'invite-admin.html',
    selector: 'invite-admin-page',
    providers: [EmailService]
})

export class InviteAdminPage {
    invite = { email: '', firstname: '', lastname: '', notes: '' };
    InviteMemberForm;
    council;
    councilsLength = false;
    result: FirebaseObjectObservable<any>;
    isValidEmail = true;
    emailErr = false;

    adminname;

    firstShown;

    constructor(public http: Http,
        public navctrl: NavController,
        public fs: FirebaseService,
        public af: AngularFire,
        public alertCtrl: AlertController,
        public appService: AppService,
        public toast: ToastController,
        public emailService: EmailService, public loadingCtrl: LoadingController) {
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
        // let loader = this.loadingCtrl.create({
        //     spinner: 'hide',
        //     content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
        // });
        // loader.present();

        this.emailErr = false;

        this.navctrl.push(InviteAdminSuccessPage);

        // this.emailService.inviteAdminEmail(this.invite.firstname + " " + this.invite.lastname, this.invite.email, this.adminname)
        //     .then(res => {
        //         res.subscribe(result => {
        //             if (result.status === 200) {
        //                 loader.dismiss();
        //                 this.navctrl.push(InviteAdminSuccessPage)
        //             } else {
        //                 loader.dismiss();
        //                 this.showAlert('Connection error.');
        //             }
        //         });
        //     }, err => {
        //         loader.dismiss();
        //         this.showAlert('Connection error.');
        //     }).catch(err => {
        //         console.log('err ---> ', err);
        //         loader.dismiss();
        //         this.showAlert('Connection error.');
        //     });
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