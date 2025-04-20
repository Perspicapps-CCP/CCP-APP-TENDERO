import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { LocalizationService } from '../services/localization.service';

@Pipe({
  name: 'localCurrency',
  standalone: true,
  pure: false,
})
export class LocalCurrencyPipe implements PipeTransform {
  constructor(private localizationService: LocalizationService) {}

  transform(
    value: number | string,
    currencyCode?: string,
    display?: 'code' | 'symbol' | 'symbol-narrow' | string | boolean,
    digitsInfo?: string,
  ): string | null {
    const locale = this.localizationService.getLocale();
    const currency = currencyCode || this.localizationService.getCurrencyCode();

    const currencyPipe = new CurrencyPipe(locale);
    return currencyPipe.transform(value, currency, display, digitsInfo);
  }
}
