import { Component } from '@angular/core';
import { NavController, Loading, ToastController } from 'ionic-angular';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { User } from '../../user/user';
import { Invitee } from '../invite/invitee.model';
import { Observable } from "rxjs/Rx";
import { AlertController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { EmailService } from '../../providers/emailservice';
import * as jazzicon from 'jazzicon';
import { WelcomePage } from '../welcome/welcome.component';
import { LoadingControllerService } from '../../services/LoadingControllerService';
import { NgZone } from '@angular/core';

@Component({
  selector: 'create-account',
  templateUrl: 'create-account.html',
  providers: [EmailService]
})

export class CreateAccountPage {
  loading: Loading;
  invitee$: Observable<Invitee>;
  newUser: User = new User;
  createAccountForm;
  emailTaken = false;
  isValidEmail = true;
  isInvitedEmail = true;
  isValidEmailFormat = false;
  isValidPwd = false;

  constructor(public navCtrl: NavController,
    public loaderService: LoadingControllerService,
    public firebaseService: FirebaseService,
    public alertCtrl: AlertController,
    public emailService: EmailService,
    public toast: ToastController,
    private zone: NgZone) { }

  createAccount() {
    // this.passwordErr = false;
    // password validation
    if (this.newUser.password.length < 6) {
      // this.passwordErr = true;
      // this.showAlert('6 characters required');
    }
    else {
      this.emailTaken = false;

      let loader = this.loaderService.getLoadingController();
      loader.present();

      this.firebaseService.findUsrByEmail(this.newUser.email).then((res) => {
        if (res === true) {
          loader.dismiss();
          this.emailTaken = true;
          // this.showAlert('Email taken');
        }
        else {
          this.firebaseService.findInviteeeByEmail(this.newUser.email).then(res => {
            if (res !== false) {
              res.forEach(invitee => {
                this.newUser.firstname = invitee.val().firstname;
                this.newUser.lastname = invitee.val().lastname;
                //email is already der in user   
                //password is already der in user
                //lds org name is already der in user
                this.newUser.unittype = invitee.val().unittype;
                this.newUser.unitnumber = invitee.val().unitnumber;
                this.newUser.avatar = "avatar"; // time being hard coded..later need to work..
                this.newUser.councils = invitee.val().councils;
                this.newUser.calling = "";
                this.newUser.isadmin = false;
                this.newUser.createdby = invitee.val().createdby;
                this.newUser.createddate = '';
                this.newUser.lastupdateddate = invitee.val().lastupdateddate;
                this.newUser.isactive = true;

                // after verifying and filling properties create new user.
                // let flag = false;
                let userAvatar = this.generateIdenticon();
                this.firebaseService.signupNewUser(this.newUser, userAvatar)
                  .then(fbAuthToken => {
                    console.log('fbAuthToken --- ' + fbAuthToken);
                    var uid = localStorage.getItem('createdUsrId');
                    //onSuccess redirect to Menu page                
                    this.emailService.emailCreateAccount(invitee.val().firstname, invitee.val().lastname, invitee.val().unitnumber, invitee.val().email, fbAuthToken, uid).subscribe(res => {
                      //this.navCtrl.push(LoginPage);
                      this.navCtrl.push(WelcomePage);
                      loader.dismiss();
                    });
                  }).catch(err => this.showAlert('Connection error.'));
              });
            }
            else {
              loader.dismiss();
              this.isInvitedEmail = false;
              //this.showAlert('Not invited!');
            }
          });
        }
      });
    }
  }

  sendWelcomeMail() {

  }

  emailChange($event) {
    this.zone.run(() => {
      if ((new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test($event.target.value))) {
        this.isValidEmail = true;
      }
      else {
        this.isValidEmail = false;
      }
    });
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
    let toast = this.toast.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  cancel() {
    this.navCtrl.pop();
  }

  keypresssed($event) {
    this.zone.run(() => {
      this.isValidEmail = true;
      this.emailTaken = false;
      this.isInvitedEmail = true;
      if ((new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test($event.target.value))) {
        this.isValidEmailFormat = true;
      }
      else {
        this.isValidEmailFormat = false;
      }
    });
  }

  pswrdkeypresssed($event) {
    this.zone.run(() => {
      if ($event.target.value.length < 6 || $event.target.value.trim() === '') {
        this.isValidPwd = false;
      }
      else {
        this.isValidPwd = true;
      }
    });
  }

  usrnamekeypresssed($event) {
    this.zone.run(() => {

    });
  }

}
