import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'input[appNumbersOnly]',
  standalone: true,
})
export class OnlyNumbersDirective {
  constructor(private _el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const initalValue = this._el.nativeElement.value;
    this._el.nativeElement.value = initalValue.replace(/\D+/g, '');
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }
}
