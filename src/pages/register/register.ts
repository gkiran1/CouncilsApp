import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, Loading } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service';
import { AngularFire, AuthProviders, AuthMethods, FirebaseListObservable, FirebaseObjectObservable, FirebaseApp } from 'angularfire2';
import { Headers, Http, Response } from "@angular/http";
import * as firebase from 'firebase';
import { AngularFireModule } from 'angularfire2/';
import { firebaseConfig } from '../../environments/firebase';
import { DisplayPage } from '../display/display';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { User } from '../../providers/app-service';

@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
  providers: [FirebaseService]
})
export class RegisterPage {
  // usr: User;
  // loading: Loading;
  // createSuccess = false;

  // public fireAuth: any;
  // public userProfile: any;




  // // createSuccess = false;
  // registerCredentials = { email: '', password: '', ldsorgusername: '', platform: '', unit: '' };

  // constructor(
  //   private nav: NavController,
  //   private auth: AuthService,
  //   private alertCtrl: AlertController,
  //   private http: Http,
  //   private af: AngularFire,
  //   private loadingCtrl: LoadingController,
  //   private firebaseService: FirebaseService
  // ) {

  //   this.usr = new User({
  //     firstname: 'Bharathi',
  //     lastname: 'Tenkani',
  //     email: 'tbharati7@gmail.com',
  //     password: 'mightydoll@12345',
  //     ldsusername: 'ldsbharathi',
  //     unittype: 'Stack',
  //     unitnumber: 1,
  //     avatar: 'avatar',
  //     isadmin: false,
  //     createdby: 'createdby',
  //     createddate: ((new Date()).toString()).slice(0, 16),
  //     lastupdateddate: 'lastupdateddate',
  //     isactive: true
  //   });

  //  // this.signupNewUser(this.usr);

  // }

  // signupNewUser(usr) {
  //   this.firebaseService.signupNewUser(usr);
  // }

  // create() {
  //   this.nav.push(DisplayPage, this.registerCredentials);
  // }

  // signUpUser(registerCredentials: any): any {

  //   this.fireAuth.createUserWithEmailAndPassword(registerCredentials.email, registerCredentials.password).then((newUser) => {
  //     // Sign in the user.
  //     this.fireAuth.signInWithEmailAndPassword(registerCredentials.email, registerCredentials.password).then((authenticatedUser) => {
  //       // Successful login, create user profile.
  //       this.userProfile.child(authenticatedUser.uid).set({
  //         email: registerCredentials.email,
  //         password: registerCredentials.password,
  //         username: registerCredentials.ldsorgusername,
  //         platform: registerCredentials.platform,
  //         unit: registerCredentials.unit
  //       });
  //     });
  //     // return newUser;
  //   });

  // }
  //   createAccount(registerCredentials: any): any {

  //   this.fireAuth.createUserWithEmailAndPassword(registerCredentials.email, registerCredentials.password).then((newUser) => {
  //     // Sign in the user.
  //     this.fireAuth.signInWithEmailAndPassword(registerCredentials.email, registerCredentials.password).then((authenticatedUser) => {
  //       // Successful login, create user profile.
  //       this.userProfile.child(authenticatedUser.uid).set({
  //         email: registerCredentials.email,
  //         password: registerCredentials.password,
  //         username: registerCredentials.ldsorgusername,
  //         platform: registerCredentials.platform,
  //         unit: registerCredentials.unit
  //       });
  //     });
  //     // return newUser;
  //   });

  // }


  // public register() {

  //   this.signUpUser(this.registerCredentials);

  //   //  this.showLoading()
  //   //     this.auth.register(this.registerCredentials).subscribe(allowed => {
  //   //       if (allowed) {
  //   //         setTimeout(() => {
  //   //         this.loading.dismiss();
  //   //         this.nav.setRoot(DisplayPage)
  //   //         });
  //   //       }
  //   //     },
  //   //     // error => {
  //   //     //   this.showError(error);
  //   //     // }
  //   //     );
  // }
  // // showLoading() {
  // //   this.loading = this.loadingCtrl.create({
  // //     content: 'Please wait...'
  // //   });
  // //   this.loading.present();
  // // }

  // // showError(text) {
  // //   setTimeout(() => {
  // //     this.loading.dismiss();
  // //   });

  // //   let alert = this.alertCtrl.create({
  // //     title: 'Fail',
  // //     subTitle: text,
  // //     buttons: ['OK']
  // //   });
  // //   alert.present(prompt);
  // // }


  // //   this.auth.register(this.registerCredentials).subscribe(success => {
  // //     if (success) {
  // //       this.createSuccess = true;
  // //         this.showPopup("Success", "Account created.");
  // //     } else {
  // //       this.showPopup("Error", "Problem creating account.");
  // //     }
  // //   },
  // //   error => {
  // //     this.showPopup("Error", error);
  // //   });
  // //   this.signUpUser(this.registerCredentials);
  // // }

  // // showPopup(title, text) {
  // //   let alert = this.alertCtrl.create({
  // //     title: title,
  // //     subTitle: text,
  // //     buttons: [
  // //      {
  // //        text: 'OK',
  // //        handler: data => {
  // //          if (this.createSuccess) {
  // //            this.nav.popToRoot();
  // //          }
  // //        }
  // //      }
  // //    ]
  // //   });
  // //   alert.present();
  // // }


}