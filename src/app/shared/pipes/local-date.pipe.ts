import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LocalizationService } from '../services/localization.service';

@Pipe({
  name: 'localDate',
  standalone: true,
  pure: false,
})
export class LocalDatePipe implements PipeTransform {
  private lastLocale = '';

  constructor(private localizationService: LocalizationService) {
    // Nos suscribimos a cambios en el locale
    this.localizationService.currentLocale$.subscribe(() => {
      // Solo para forzar el reprocesamiento del pipe cuando cambie el locale
      this.lastLocale = '';
    });
  }

  transform(value: any, format?: string, dateOnly = false): string | null {
    const locale = this.localizationService.getLocale();
    const datePipe = new DatePipe(locale);

    if (!format) {
      switch (locale) {
        case 'es-CO':
          if (dateOnly) {
            // Solo fecha en formato colombiano
            return datePipe.transform(value, 'dd/MM/yyyy');
          } else {
            // Formato colombiano con AM/PM en minúscula
            const formattedDate = datePipe.transform(value, 'dd/MM/yyyy h:mm a');
            return formattedDate ? formattedDate.replace('AM', 'a.m.').replace('PM', 'p.m.') : null;
          }
        case 'es-ES':
          if (dateOnly) {
            // Solo fecha en formato español
            return datePipe.transform(value, 'dd/MM/yyyy');
          } else {
            // Formato español (24 horas)
            return datePipe.transform(value, 'dd/MM/yyyy HH:mm');
          }
        default:
          if (dateOnly) {
            // Solo fecha en formato estadounidense
            return datePipe.transform(value, 'MM/dd/yyyy');
          } else {
            // Formato estadounidense
            return datePipe.transform(value, 'MM/dd/yyyy h:mm a');
          }
      }
    }

    return datePipe.transform(value, format);
  }
}
