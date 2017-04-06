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
      creditcardNo: ['', Validators.compose([Validators.required, Validators.minLength(18), Validators.maxLength(18)])],
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
}
