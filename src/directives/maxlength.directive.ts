import {Directive, ElementRef, Renderer, AfterViewInit} from "@angular/core";

@Directive({
  selector: '[maxlength]'
})

export class MaxLengthDirective implements AfterViewInit {

  constructor (private _elRef: ElementRef, private _renderer: Renderer) {}

  ngAfterViewInit() {

    let input = null;

    if( this._elRef.nativeElement.tagName === 'ION-INPUT') {
        input = this._elRef.nativeElement.querySelector("input");
    } 

    if( input ) {
        this._renderer.setElementAttribute(input, 'maxlength', '25');      
    }   
 
  }

}