import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { FirebaseService } from '../../environments/firebase/firebase-service';

@Component({
    selector: 'about',
    templateUrl: 'about.html',
    providers: [FirebaseService]
})
export class AboutPage {
    public SoftwareVersion: string;
    public PrivacyPolicy: string;
    public TermsOfUse: string;
    public Email: string;
    public WebAddress: string;
    public Phone: string;
    objAbout: any;

    constructor(public navCtrl: NavController, private ser: FirebaseService) {
        ser.getAboutus().then(res => {
            this.objAbout = res;
            this.SoftwareVersion = res.softwareversion;
            this.PrivacyPolicy = res.privacypolicy;
            this.TermsOfUse = res.termsofuse;
            this.Email = res.email;
            this.WebAddress = res.web;
            this.Phone = res.phone;
        })
    }

}
