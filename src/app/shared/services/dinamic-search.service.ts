import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DinamicSearchService {
  dynamicSearch(arreglo: any[], termSearch: string, columnsObjectToFilter?: string[]) {
    // Si el término de búsqueda está vacío, devuelve todo el arreglo original
    if (!termSearch || termSearch.trim() === '') {
      return arreglo;
    }

    const busquedaMinusculas = termSearch.toString().toLowerCase().trim();

    return arreglo.filter(objeto => {
      if (columnsObjectToFilter && columnsObjectToFilter.length > 0) {
        // Búsqueda en columnas específicas
        return columnsObjectToFilter.some(columna => {
          // Verifica que la propiedad exista en el objeto
          if (objeto[columna] === undefined || objeto[columna] === null) {
            return false;
          }

          // Convierte el valor a string para poder buscar en cualquier tipo de dato
          const valorString = String(objeto[columna]).toLowerCase();
          return valorString.includes(busquedaMinusculas);
        });
      } else {
        // Búsqueda en todas las propiedades del objeto
        return Object.entries(objeto).some(([_, valor]) => {
          // Si el valor es null o undefined, no lo considera
          if (valor === null || valor === undefined) {
            return false;
          }

          // Convierte cualquier tipo de valor a string
          const valorString = String(valor).toLowerCase();
          return valorString.includes(busquedaMinusculas);
        });
      }
    });
  }
}
