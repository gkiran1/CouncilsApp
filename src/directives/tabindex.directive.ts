import { Directive, HostListener, Input } from '@angular/core';
import { TextInput } from 'ionic-angular';

@Directive({
	selector: '[tabbedindex]'
})
export class TabindexDirective {

	constructor(private inputRef: TextInput) { }

	@HostListener('keydown', ['$event']) onInputChange(e) {
		var code = e.keyCode || e.which;
		alert('here');
		if (code === 13) {
			e.preventDefault();
			this.inputRef.focusNext();
		}
	}
}