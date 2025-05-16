import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Entrega } from '../interfaces/entregas.interface';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Producto } from '../interfaces/productos.interface';

@Injectable({
  providedIn: 'root',
})
export class EntregasService {
  private apiUrl = environment.apiUrlCCP;
  constructor(private http: HttpClient) {}

  getDeliveries(): Observable<Entrega[]> {
    return this.http.get<any>(`${this.apiUrl}/api/v1/sales/sales`).pipe(
      map((response: any) => {
        const entregas: Entrega[] = [];
        if (response && Array.isArray(response)) {
          console.log('EesponseArray', response);
          response.forEach((item: any) => {
            const items = item.items;
            console.log('Item', item);
            if (Array.isArray(item.deliveries)) {
              item.deliveries.forEach((delivery: any) => {
                const productos: Producto[] = [];
                let orders = delivery?.orders;
                if (Array.isArray(orders)) {
                  orders.forEach((order: any) => {
                    const product: Producto = {} as Producto;
                    const productValue = items.find(
                      (prod: any) => prod['product']?.product_code === order.product_code,
                    );
                    product.name = productValue['product'].name;
                    product.price = productValue['product'].price;
                    product.quantity = productValue.quantity;
                    product.product_code = productValue['product'].product_code;
                    product.image = productValue['product'].images[0];
                    productos.push(product);
                  });
                }
                const entrega: Entrega = {} as Entrega;
                entrega.guide_number = delivery?.shipping_number || '';
                entrega.status = item?.status || '';
                entrega.delivery_date = new Date(delivery?.delivery_date || '')
                  .toISOString()
                  .slice(0, 10);
                entrega.initial_date = new Date(delivery?.created_at || '')
                  .toISOString()
                  .slice(0, 10);
                entrega.phone = item?.client.phone || '';
                entrega.address = item?.address.line || '';
                entrega.products = productos;
                entregas.push(entrega);
              });
            }
          });
        }
        console.log('entregas', entregas);
        return entregas;
      }),
    );
  }
}
