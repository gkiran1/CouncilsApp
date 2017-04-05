import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { WelcomePage } from '../menu/menu';


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

    constructor(public navCtrl: NavController, private service: FirebaseService) {
        service.getAboutus()
        .then(about => {
            about.forEach(result=>{
                this.SoftwareVersion = result.val().softwareversion;
                this.PrivacyPolicy = result.val().privacypolicy;
                this.TermsOfUse = result.val().termsofuse;
                this.Email = result.val().email;
                this.WebAddress = result.val().web;
                this.Phone = result.phone;
            });
           
         });
    }

      cancel() {
    this.navCtrl.setRoot(WelcomePage);
  }


}
