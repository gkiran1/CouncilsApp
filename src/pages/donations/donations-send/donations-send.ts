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
      creditcardNo: ['',  Validators.compose([Validators.required, Validators.minLength(19), Validators.maxLength(19)])],
      creditValidthru: ['', Validators.required],
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
    let cardNumber = event.target.value.replace(/[^-0-9]/g, '');
    if ((cardNumber.length === 4) || (cardNumber.length === 9) || (cardNumber.length === 14)) {
      cardNumber = cardNumber + '-';     
    }
     (<FormControl>this.donationForm.controls['creditcardNo']).setValue(cardNumber);
  }
}
