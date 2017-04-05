import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DonationsThankyouPage } from '../donations-thankyou/donations-thankyou';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { validateEmail } from '../../../custom-validators/custom-validator';

@Component({
  selector: 'page-donations-send',
  templateUrl: 'donations-send.html'
})
export class DonationsSendPage {
  donationForm: FormGroup;
  constructor(fb: FormBuilder, public nav: NavController, public navParams: NavParams) {
    this.donationForm = fb.group({
      amount: ['', Validators.required],
      fullname: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, validateEmail])],
      donationtype: ['onetime', Validators.required],
      creditcardNo: ['', Validators.compose([Validators.required, Validators.minLength(19), Validators.maxLength(19)])],
      creditValidthru: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(5)])],
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DonationsSendPage');
  }

  send() {
    this.nav.push(DonationsThankyouPage);
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
    let cardNumber = event.target.value.replace(/[^0-9]/g, '');
    cardNumber = cardNumber.match(/.{1,4}/g);
    cardNumber = cardNumber ? cardNumber.join('-') : cardNumber;
    (<FormControl>this.donationForm.controls['creditcardNo']).setValue(cardNumber);
  }
  formatToValidThru(event) {
    let validthru = event.target.value.replace(/[^0-9]/g, '');
    validthru = /^[^01]/.test(validthru) ? '0' + validthru : validthru;
    validthru = /1[^012]/.test(validthru.substr(0, 2)) ? validthru.replace(validthru.charAt(1), '') : validthru;
    validthru = validthru.match(/.{1,2}/g);
    validthru = validthru ? validthru.join('/') : validthru;
    (<FormControl>this.donationForm.controls['creditValidthru']).setValue(validthru);
  }
}
