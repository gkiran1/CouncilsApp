import { Component } from '@angular/core';
import { Invitee } from './invitee.model';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { AlertController, NavController, LoadingController, ToastController } from 'ionic-angular';
import { AppService } from '../../providers/app-service';
import { InvitationSuccessPage } from './success';
import { Http } from '@angular/http';
import { EmailService } from '../../providers/emailservice'

@Component({
    templateUrl: 'invite.html',
    selector: 'invite-page',
    providers: [EmailService]
})
export class InviteMemberPage {
    invite: Invitee;
    InviteMemberForm;
    council;
    councilsLength = false;
    result: FirebaseObjectObservable<any>;
    isValidEmail = true;
    emailErr = false;

    areaCouncils = []
    stakeCouncils = [];
    wardCouncils = [];
    addedCouncils = [];
    adminname;

    firstShown;

    constructor(public http: Http,
        public navctrl: NavController,
        public fs: FirebaseService,
        public af: AngularFire,
        public alertCtrl: AlertController,
        public appService: AppService,
        public toast: ToastController,
        public emailService: EmailService, public loadingCtrl: LoadingController, ) {
        this.invite = new Invitee;

        var unitType = localStorage.getItem('unitType');

        this.af.auth.subscribe(auth => {
            if (auth !== null) {
                this.af.database.object('/users/' + auth.uid).subscribe(res => {
                    this.adminname = res.firstname + " " + res.lastname;
                    this.invite.unittype = res.unittype;
                    this.invite.unitnumber = res.unitnumber;
                    this.invite.createdby = appService.uid;
                    this.invite.createddate = new Date().toDateString();
                    this.invite.lastupdateddate = new Date().toDateString();
                    this.invite.isactive = true;
                    this.fs.getCouncilsByType(res.unitnumber).subscribe(councils => {
                        // this.council = councils;

                        councils.forEach(council => {

                            if (unitType === 'Area') {
                                if (council.under === 'Added') {
                                    this.addedCouncils.push(council);
                                }
                                else if (council.council !== 'Stake Presidents') {
                                    this.areaCouncils.push(council);
                                }
                            }
                            else if (unitType === 'Stake') {
                                if (council.under === 'Added') {
                                    this.addedCouncils.push(council);
                                }
                                else if (council.council !== 'Stake Presidents' && council.council !== 'Bishops') {
                                    this.stakeCouncils.push(council);
                                }
                            }
                            else if (unitType === 'Ward') {
                                if (council.under === 'Added') {
                                    this.addedCouncils.push(council);
                                }
                                else if (council.council !== 'Bishops') {
                                    this.wardCouncils.push(council);
                                }
                            }

                            if (this.areaCouncils.length > 0) {
                                this.firstShown = 'Area';
                            }
                            else if (this.stakeCouncils.length > 0) {
                                this.firstShown = 'Stake';
                            }
                            else if (this.wardCouncils.length > 0) {
                                this.firstShown = 'Ward';
                            }
                            else if (this.addedCouncils.length > 0) {
                                this.firstShown = 'Added';
                            }

                        });

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
        //     });
        //     this.invite.councils = [];

        // });
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
        let loader = this.loadingCtrl.create({
            spinner: 'hide',
            content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
        });

        loader.present();

        this.emailErr = false;

        this.areaCouncils.forEach(e => e.selected ? this.invite.councils.push(e.$key) : '');
        this.stakeCouncils.forEach(e => e.selected ? this.invite.councils.push(e.$key) : '');
        this.wardCouncils.forEach(e => e.selected ? this.invite.councils.push(e.$key) : '');
        this.addedCouncils.forEach(e => e.selected ? this.invite.councils.push(e.$key) : '');

        this.emailService.inviteMemberEmail(this.invite.firstname + " " + this.invite.lastname, this.invite.unitnumber, this.invite.email, this.adminname)
            .then(res => {
                res.subscribe(result => {
                    if (result.status === 200) {
                        this.fs.createInvitee(this.invite)
                            .then(res => {
                                loader.dismiss();
                                this.navctrl.push(InvitationSuccessPage)
                            })
                            .catch(err => {
                                loader.dismiss();
                                this.emailErr = true;
                            });
                    } else {
                        loader.dismiss();
                        this.showAlert('Connection error.');
                    }
                });
            }, err => {
                loader.dismiss();
                this.showAlert('Connection error.');
            });
    }

    itemChanged() {
        this.councilsLength = false;
        this.areaCouncils.forEach(e => {
            if (e.selected) {
                this.councilsLength = true;
                return;
            }
        });
        if (this.councilsLength === false) {
            this.stakeCouncils.forEach(e => {
                if (e.selected) {
                    this.councilsLength = true;
                    return;
                }
            });
        }
        if (this.councilsLength === false) {
            this.wardCouncils.forEach(e => {
                if (e.selected) {
                    this.councilsLength = true;
                    return;
                }
            });
        }
        if (this.councilsLength === false) {
            this.addedCouncils.forEach(e => {
                if (e.selected) {
                    this.councilsLength = true;
                    return;
                }
            });
        }
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

    close() {
        this.navctrl.pop({ animate: true, animation: 'transition', direction: 'back' });
    }

}