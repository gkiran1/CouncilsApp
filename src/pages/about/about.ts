import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { SettingsPage } from '../settings/settings';


@Component({
    selector: 'page-about',
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

    constructor(public navCtrl: NavController, private service: FirebaseService, private loadingCtrl: LoadingController) {
        let loader = this.loadingCtrl.create({
            spinner: 'dots',
        });
        loader.present();
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
           loader.dismiss();
         }).catch(err => {
                loader.dismiss();
                
            });

    }

      cancel() {
    this.navCtrl.setRoot(SettingsPage);
  }


}
