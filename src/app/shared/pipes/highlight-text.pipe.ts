import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlightText',
  standalone: true,
  pure: false,
})
export class HighlightTextPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: any, search = ''): SafeHtml {
    const valueStr = value ? String(value) : '';
    if (!search || search.trim() === '') {
      return valueStr;
    }

    // Escapar caracteres especiales de regex
    const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    // Crear la expresión regular con el término escapado
    const expresion = new RegExp(
      '(?![^&;]+;)(?!<[^<>]*)(' + escapedSearch + ')(?![^<>]*>)(?![^&;]+;)',
      'gi',
    );

    const respuesta = '<strong style="color:black" class="highlight">$1</strong>';
    return this.sanitizer.bypassSecurityTrustHtml(valueStr.replace(expresion, respuesta));
  }
}
