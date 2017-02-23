import { Component } from '@angular/core';
import { Invitee } from './invitee.model';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { AlertController, NavController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { InvitationSuccessPage } from './success'

@Component({
    templateUrl: 'invite.html'
})
export class InviteMemberPage {
    invite: Invitee;
    InviteMemberForm;
    council;
    result: FirebaseObjectObservable<any>;
    constructor(public navctrl: NavController, public fs: FirebaseService, public af: AngularFire, public alertCtrl: AlertController, public appService: AppService) {
        this.invite = new Invitee;
        appService.getUser().subscribe(res => {
            this.invite.unittype = res.unittype;
            this.invite.unitnumber = res.unitnumber;
            this.invite.createdby = appService.uid;
            this.invite.createddate = new Date().toString();
            this.invite.lastupdateddate = new Date().toString();
            this.invite.isactive = true;
            this.fs.getCouncilsByType(res.unittype).subscribe(councils => {
                this.council = councils;
                console.log(councils, this.invite.councils);
            });
            this.invite.councils = [];

        });
    }


    inviteMember() {
        this.council.forEach(e => e.selected ? this.invite.councils.push(e.$key) : '');
        console.log(this.invite.councils);

        this.fs.createInvitee(this.invite)
            .then(res => this.navctrl.push(InvitationSuccessPage))
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

}