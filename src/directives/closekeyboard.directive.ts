import { Directive, HostListener, Input } from '@angular/core';
import { TextInput, Keyboard } from 'ionic-angular';

@Directive({
	selector: '[closekeyboard]'
})
export class CloseKeyboardDirective {

	constructor(private inputRef: TextInput, private keyboard: Keyboard) { }

	@HostListener('keydown', ['$event']) onkeypress(e) {
		var code = e.keyCode || e.which;
		
		if (code === 13) {
			e.preventDefault();
			this.keyboard.close();
		}
	}
}