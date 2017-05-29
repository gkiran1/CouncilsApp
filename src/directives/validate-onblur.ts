import { Directive } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[validate-onblur]',
  host: {
    '(focus)': 'onFocus($event)',
    '(blur)': 'onBlur($event)'
  }
})
export class ValidateOnBlurDirective {
    private validators: any;
    private asyncValidators: any;
    constructor(public formControl: NgControl) {
    }
    onFocus($event) {
      this.validators = this.formControl.control.validator;
      this.asyncValidators = this.formControl.control.asyncValidator;
      this.formControl.control.clearAsyncValidators();
      this.formControl.control.clearValidators();
    }

    onBlur($event) {
      this.formControl.control.setAsyncValidators(this.asyncValidators);
      this.formControl.control.setValidators(this.validators);
      this.formControl.control.updateValueAndValidity();
    }
}