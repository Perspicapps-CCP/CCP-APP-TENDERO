import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Sales } from '../interfaces/ventas.interface';
import { LocalDatePipe } from 'src/app/shared/pipes/local-date.pipe';
import { LocalizationService } from 'src/app/shared/services/localization.service';

@Injectable({
  providedIn: 'root',
})
export class PedidosService {
  private apiUrl = environment.apiUrlCCP;
  private localDatePipe: LocalDatePipe;

  constructor(
    private http: HttpClient,
    private localizationService: LocalizationService,
  ) {
    this.localDatePipe = new LocalDatePipe(this.localizationService);
  }

  obtenerVentasCliente(): Observable<Sales[]> {
    return this.http.get<Sales[]>(`${this.apiUrl}/api/v1/sales/sales/`).pipe(
      map((response: any) => {
        return response.map((venta: any) => ({
          ...venta,
          totalItems: venta.items.length.toString(),
          date: this.localDatePipe.transform(venta.date, undefined, true) || '',
        }));
      }),
    );
  }
}
