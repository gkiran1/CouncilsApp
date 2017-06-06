import { Component } from '@angular/core';
import { NavController, LoadingController, Loading, ToastController } from 'ionic-angular';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { User } from '../../user/user';
import { Invitee } from '../invite/invitee.model';
import { Observable } from "rxjs/Rx";
import { AlertController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { EmailService } from '../../providers/emailservice';
import * as jazzicon from 'jazzicon';


@Component({
  selector: 'create-account',
  templateUrl: 'create-account.html',
  providers: [EmailService]
})

export class CreateAccountPage {
  loading: Loading;
  invitee$: Observable<Invitee>;
  //user$: Observable<User> todo: R & D
  newUser: User = new User;
  createAccountForm;
  emailErr = false;
  isValidEmail = true;

  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, public firebaseService: FirebaseService, public alertCtrl: AlertController, public emailService: EmailService, public toast: ToastController) { }
  createAccount() {
    // this.passwordErr = false;
    // password validation
    if (this.newUser.password.length < 6) {
      // this.passwordErr = true;
      // this.showAlert('6 characters required');
    }
    // username@domain.com
    else {
      this.emailErr = false;
      let loader = this.loadingCtrl.create({
        spinner: 'hide',
        content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
      });
      loader.present();

      this.firebaseService.findUserByEmail(this.newUser.email).subscribe((usr) => {
        if (usr) {
          loader.dismiss();
          this.emailErr = true;
          // this.showAlert('Email taken');
        }
        else {
          this.invitee$ = this.firebaseService.findInviteeByEmail(this.newUser.email);
          this.invitee$.subscribe(invitee => {

            if (invitee) {
              this.newUser.firstname = invitee.firstname;
              this.newUser.lastname = invitee.lastname;
              //email is already der in user   
              //password is already der in user
              //lds org name is already der in user
              this.newUser.unittype = invitee.unittype;
              this.newUser.unitnumber = invitee.unitnumber;
              this.newUser.avatar = "avatar"; // time being hard coded..later need to work..
              this.newUser.councils = invitee.councils;
              this.newUser.calling = "";
              this.newUser.isadmin = false;
              this.newUser.createdby = invitee.createdby;
              this.newUser.createddate = '';
              this.newUser.lastupdateddate = invitee.lastupdateddate;
              this.newUser.isactive = true;

              // after verifying and filling properties create new user.
              let flag = false;
              let userAvatar = this.generateIdenticon();
              this.firebaseService.signupNewUser(this.newUser, userAvatar)
                .then(res => {
                  //onSuccess redirect to Menu page
                  flag = true;
                }).catch(err => this.showAlert('Internal server error.'));

              let v = setInterval(() => {
                if (flag) {
                  this.emailService.emailCreateAccount(invitee.firstname, invitee.lastname, invitee.unitnumber, invitee.email);
                  this.navCtrl.push(LoginPage);
                  loader.dismiss();
                  clearInterval(v);
                }
              }, 50);

            } else {
              loader.dismiss();
              this.showAlert('Not invited!');
            }
          });
        }
      });
    }
  }

  sendWelcomeMail() {

  }

  emailChange($event) {
    this.emailErr = false;
    if ((new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test($event.target.value))) {
      this.isValidEmail = true;
    }
    else {
      this.isValidEmail = false;
    }
  }

  generateIdenticon() {
    var el = jazzicon(100, Math.round(Math.random() * 10000000000))
    var svg = el.querySelector('svg');

    var s = new XMLSerializer().serializeToString(el.querySelector('svg'));
    //  var canvas = document.createElement('canvas');
    //  var context = canvas.getContext('2d');
    //  var img = new Image();

    var base64 = window.btoa(s);
    //  img.src = 'data:image/svg+xml,'+base64;
    //  context.drawImage(img, 0, 0);
    return base64;
    //this.firebaseService.saveIdenticon(uid, base64 );


  }

  showAlert(text) {
    // let alert = this.alertCtrl.create({
    //   title: '',
    //   subTitle: text,
    //   buttons: ['OK']
    // });
    // alert.present();

    let toast = this.toast.create({
      message: text,
      duration: 3000
    })

    toast.present();
  }


  cancel() {
    this.navCtrl.pop();
  }

}
