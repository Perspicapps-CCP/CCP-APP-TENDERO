import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DinamicSearchService {
  dynamicSearch(arreglo: any[], termSearch: string, columnsObjectToFilter?: string[]) {
    const valueStr = termSearch ? termSearch + '' : '';
    const busquedaMinusculas = valueStr.toLowerCase();
    return arreglo.filter(objeto => {
      if (columnsObjectToFilter) {
        return columnsObjectToFilter.some(columna => {
          return (objeto[columna] + '').toLowerCase().includes(busquedaMinusculas);
        });
      } else {
        return Object.values(objeto).some(
          valor =>
            typeof valor === 'string' && valor.toLocaleLowerCase().includes(busquedaMinusculas),
        );
      }
    });
  }
}
