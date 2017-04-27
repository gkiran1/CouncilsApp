import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { DonationsThankyouPage } from '../donations-thankyou/donations-thankyou';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { validateEmail } from '../../../custom-validators/custom-validator';
import { Http } from '@angular/http';
import { NgZone } from '@angular/core';

declare var Stripe: any;

@Component({
  selector: 'page-donations-send',
  templateUrl: 'donations-send.html'
})
export class DonationsSendPage {
  donationForm: FormGroup;
  private token: string = '';
  donationtype = 'onetime';
  constructor(public zone: NgZone, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public http: Http, fb: FormBuilder, public nav: NavController, public navParams: NavParams) {
    this.donationForm = fb.group({
      amount: ['', Validators.required],
      fullname: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, validateEmail])],
      creditcardNo: ['', Validators.compose([Validators.required, Validators.minLength(18), Validators.maxLength(18)])],
      creditValidthru: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(5)])],
    });
    Stripe.setPublishableKey('pk_test_s1UhNXOG0r73kmqPi3fQV2BE');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DonationsSendPage');
  }

  cancel() {
    this.nav.pop();
  }

  addCurrencySysmbol(event) {
    let amount = event.target.value.replace(/[^0-9]/g, '');
    amount = amount ? '$ ' + amount : '';
    (<FormControl>this.donationForm.controls['amount']).setValue(amount);
  }
  formatToCreditNumber(event) {
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
    event.target.setSelectionRange(start, start); // to set cursor position for inline editing - JS method 
  }
  formatToValidThru(event) {
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
    event.target.setSelectionRange(start, start);
  }

  selectDonationtype(type) {
    this.donationtype = type;
  }

  send(value) {
    console.log(value);
    let loader = this.loadingCtrl.create({
      spinner: 'dots',
    });
    loader.present();
    Stripe.card.createToken({
      number: value.creditcardNo.split('-').join(''),//'4242424242424242',378282246310005
      exp_month: value.creditValidthru.split('/')[0],
      exp_year: value.creditValidthru.split('/')[1]
    }, (status, response) => {
      if (response.error) {
        // Show the errors on the form
        loader.dismiss();
        console.log('error', response.error.message);
        this.showAlert(response.error.message);
      } else {
        // response contains id and card, which contains additional card details
        this.token = response.id;
        console.log('token - ', this.token);
        // Insert the token into the form so it gets submitted to the server
        let data = {
          stripeToken: this.token,
          amount: Number.parseInt(value.amount.substr(2)) * 100, // adding decimals
          fullname: value.fullname,
          email: value.email,
          donationtype: this.donationtype,
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
            console.log('payment success', response);
            this.zone.run(() => {
              this.nav.push(DonationsThankyouPage);
            });
          }, err => {
            loader.dismiss();
            console.log('Error:', err);
            this.showAlert('There has been an error processing your request, please try again');
          })

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
}
