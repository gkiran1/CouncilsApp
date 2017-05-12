import { Component } from '@angular/core';
import { NavController, LoadingController, Loading, ToastController } from 'ionic-angular';
import { FirebaseService } from '../../environments/firebase/firebase-service';
import { User } from '../../user/user';
import { Invitee } from '../invite/invitee.model';
import { Observable } from "rxjs/Rx";
import { AlertController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { EmailService } from '../../providers/emailservice';


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

  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, public firebaseService: FirebaseService, public alertCtrl: AlertController, public emailService: EmailService, public toast: ToastController) { }

  createAccount() {
    // password validation
    if (this.newUser.password.length < 6) {
      this.showAlert('6 characters required');
    }
    // username@domain.com
    else {
      let loader = this.loadingCtrl.create({
        spinner: 'hide',
        content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
      });
      loader.present();
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
          this.newUser.calling = invitee.calling;
          this.newUser.isadmin = false;
          this.newUser.createdby = invitee.createdby;
          this.newUser.createddate = '';
          this.newUser.lastupdateddate = invitee.lastupdateddate;
          this.newUser.isactive = true;

          // after verifying and filling properties create new user.
          let flag = false;
          this.firebaseService.signupNewUser(this.newUser)
            .then(res => {
              //onSuccess redirect to Menu page
              flag = true;

            })
            .catch(err => this.showAlert('Internal server error.'));
          loader.dismiss();
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
  }

  sendWelcomeMail() {

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
