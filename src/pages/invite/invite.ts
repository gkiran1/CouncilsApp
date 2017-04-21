import { Component } from '@angular/core';
import { Invitee } from './invitee.model';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { AlertController, NavController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { InvitationSuccessPage } from './success';
import { Http } from '@angular/http';

@Component({
    templateUrl: 'invite.html',
    selector: 'invite-page'
})
export class InviteMemberPage {
    invite: Invitee;
    InviteMemberForm;
    council;
    councilsLength = false;
    result: FirebaseObjectObservable<any>;
    constructor(public http: Http, public navctrl: NavController, public fs: FirebaseService, public af: AngularFire, public alertCtrl: AlertController, public appService: AppService) {
        this.invite = new Invitee;

        this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.af.database.object('/users/' + auth.uid).subscribe(res => {
                    this.invite.unittype = res.unittype;
                    this.invite.unitnumber = res.unitnumber;
                    this.invite.createdby = appService.uid;
                    this.invite.createddate = new Date().toDateString();
                    this.invite.lastupdateddate = new Date().toDateString();
                    this.invite.isactive = true;
                    this.fs.getCouncilsByType(res.unitnumber).subscribe(councils => {
                        this.council = councils;
                        console.log(councils, this.invite.councils);
                    });
                    this.invite.councils = [];
                });
            }
        });


        // appService.getUser().subscribe(res => {
        //     this.invite.unittype = res.unittype;
        //     this.invite.unitnumber = res.unitnumber;
        //     this.invite.createdby = appService.uid;
        //     this.invite.createddate = new Date().toDateString();
        //     this.invite.lastupdateddate = new Date().toDateString();
        //     this.invite.isactive = true;
        //     this.fs.getCouncilsByType(res.unittype).subscribe(councils => {
        //         this.council = councils;
        //         console.log(councils, this.invite.councils);
        //     });
        //     this.invite.councils = [];

        // });
    }

    inviteMember() {
        this.council.forEach(e => e.selected ? this.invite.councils.push(e.$key) : '');
        console.log(this.invite.councils);

        this.http.post('https://councilsapi-165009.appspot.com/sendmail', { 
           "event":"invite", "email": this.invite.email, "firstname": this.invite.firstname, "unitnum": this.invite.unitnumber
        }).subscribe(res => {
            console.log('invite status:', res);
            if (res.status === 200) {
                this.fs.createInvitee(this.invite)
                    .then(res => {
                        this.navctrl.setRoot(InvitationSuccessPage)
                    })
                    .catch(err => this.showAlert(err))
            } else {
                this.showAlert('Unable to invite member, please recheck the details and try again.');
            }
        });
    }

    itemChanged() {
        this.councilsLength = false;
        this.council.forEach(e => {
            if (e.selected) {
                this.councilsLength = true;
            }
        });
    }

    showAlert(errText) {
        let alert = this.alertCtrl.create({
            title: '',
            subTitle: errText,
            buttons: ['OK']
        });
        alert.present();
    }

    close() {
        this.navctrl.pop();
    }

}