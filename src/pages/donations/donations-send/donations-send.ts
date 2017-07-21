import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, LoadingController, AlertController } from 'ionic-angular';
import { DonationsThankyouPage } from '../donations-thankyou/donations-thankyou';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { validateEmail } from '../../../custom-validators/custom-validator';
import { Http } from '@angular/http';
import { NgZone } from '@angular/core';
import { FirebaseService } from '../../../environments/firebase/firebase-service';

declare var Stripe: any;

@Component({
  selector: 'page-donations-send',
  templateUrl: 'donations-send.html'
})
export class DonationsSendPage {
  donationForm: FormGroup;
  private token: string = '';
  donationtype = 'onetime';
  showCardErr = false;
  showExpDateErr = false;
  constructor(public fs: FirebaseService, public zone: NgZone, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public http: Http, fb: FormBuilder, public nav: NavController, public navParams: NavParams, public toast: ToastController,
  ) {
    this.donationForm = fb.group({
      amount: ['2900', Validators.required],
      fullname: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, validateEmail])],
      creditcardNo: ['', Validators.compose([Validators.required, Validators.minLength(18), Validators.maxLength(18)])],
      creditValidthru: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(5)])],
      creditCVV: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(3)])]
    });
    Stripe.setPublishableKey('pk_test_s1UhNXOG0r73kmqPi3fQV2BE');
  }

  ionViewDidLoad() {
  }

  cancel() {
    this.nav.pop({ animate: true, animation: 'transition', direction: 'back' });

  }

  addCurrencySysmbol(event) {
    let amount = event.target.value.replace(/[^0-9]/g, '');
    amount = amount ? '$ ' + amount : '';
    (<FormControl>this.donationForm.controls['amount']).setValue(amount);
  }
  formatToCreditNumber(event) {
    this.showCardErr = false;
    let start = event.target.selectionStart;
    // let end = event.target.selectionEnd;
    let cardNumber = event.target.value.replace(/[^0-9]/g, '');
    cardNumber = cardNumber.match(/.{1,4}/g);
    cardNumber = cardNumber ? cardNumber.join('-') : cardNumber;
    event.target.value = cardNumber;
    if (start === 5) {
      start = 6;
    } else if (start === 10) {
      start = 11;
    } else if (start === 15) {
      start = 16;
    }
    // event.target.setSelectionRange(start, start); // to set cursor position for inline editing - JS method 
  }
  formatToValidThru(event) {
    this.showExpDateErr = false;
    let start = event.target.selectionStart;
    let validthru = event.target.value.replace(/[^0-9]/g, '');
    validthru = /^[^01]/.test(validthru) ? '0' + validthru : validthru;
    validthru = /1[^012]/.test(validthru.substr(0, 2)) ? validthru.replace(validthru.charAt(1), '') : validthru;
    validthru = validthru.match(/.{1,2}/g);
    validthru = validthru ? validthru.join('/') : validthru;
    event.target.value = validthru;
    if (start === 3) {
      start = 4;
    }
    // event.target.setSelectionRange(start, start);
  }

  formatCVV($event) {
    $event.target.value = $event.target.value.replace(/[^0-9]/g, '');
  }

  selectDonationtype(type) {
    this.donationtype = type;
  }

  send(value) {
    this.showCardErr = false;
    this.showExpDateErr = false;
    let loader = this.loadingCtrl.create({
      spinner: 'hide',
      content: '<div class="circle-container"><div class="circleG_1"></div><div class="circleG_2"></div><div class="circleG_3"></div></div>',
    });
    loader.present();
    Stripe.card.createToken({
      number: value.creditcardNo.split('-').join(''),//'4242424242424242',378282246310005
      exp_month: value.creditValidthru.split('/')[0],
      exp_year: value.creditValidthru.split('/')[1],
      cvc: value.creditCVV,
      name: value.fullname
    }, (status, response) => {
      if (response.error) {
        // Show the errors on the form
        loader.dismiss();
        if (response.error.code === 'incorrect_number') {
          // this.showAlert('Invalid card number');
          this.showCardErr = true;
        } else if (response.error.code === 'invalid_expiry_year' || response.error.code === 'invalid_expiry_month') {
          //this.showAlert('Invalid expiration number');
          this.showExpDateErr = true;
        } else {
          this.showAlert(response.error.message);
        }

      } else {
        // response contains id and card, which contains additional card details
        this.token = response.id;
        // Insert the token into the form so it gets submitted to the server
        let data = {
          stripeToken: this.token,
          amount: 2900,// amount: Number.parseInt(value.amount.substr(2)) * 100, // adding decimals
          fullname: value.fullname,
          email: value.email,
          donationtype: "monthly", //donationtype: this.donationtype,
          cardNo: value.creditcardNo.split('-').join(''),
          userid: localStorage.getItem('securityToken')
        }

        let baseURL = 'https://councilsapi-165009.appspot.com/';
        let url = '';
        if (data.donationtype === 'monthly') {
          url = baseURL + 'donate-monthly';
        } else {
          url = baseURL + 'donate';
        }

        this.http.post(url, data)
          .subscribe(response => {
            loader.dismiss();
            this.fs.updateSubscriptionInfo(localStorage.getItem('securityToken'), true, response.json().id);
            this.zone.run(() => {
              this.nav.push(DonationsThankyouPage);
            });
          }, err => {
            loader.dismiss();
            this.showAlert('Connection error.');
          })

      }
    });
  }

  showAlert(errText) {
    // let alert = this.alertCtrl.create({
    //   title: '',
    //   subTitle: errText,
    //   buttons: ['OK']
    // });
    // alert.present();

    let toast = this.toast.create({
      message: errText,
      duration: 3000
    })

    toast.present();
  }
}
