import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Producto } from '../interfaces/productos.interface';
import { LocalCurrencyPipe } from 'src/app/shared/pipes/local-currency.pipe';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CatalogoService {
  private apiUrl = environment.apiUrlCCP;
  private localCurrencyPipe: LocalCurrencyPipe;
  private _productoSeleccionado?: Producto;

  constructor(
    private http: HttpClient,
    private localizationService: LocalizationService,
  ) {
    this.localCurrencyPipe = new LocalCurrencyPipe(this.localizationService);
  }

  obtenerProductos() {
    return this.http.get<Producto[]>(`${this.apiUrl}/inventory/stock/catalog/`).pipe(
      map((productos: Producto[]) => {
        return productos.map(producto => {
          const precio = this.localCurrencyPipe.transform(producto.price);
          return {
            ...producto,
            price_currency: precio || '0',
            quantity_selected: 0,
          };
        });
      }),
    );
  }

  get productoSeleccionado(): Producto | undefined {
    return this._productoSeleccionado;
  }

  set productoSeleccionado(producto: Producto) {
    this._productoSeleccionado = producto;
  }
}
