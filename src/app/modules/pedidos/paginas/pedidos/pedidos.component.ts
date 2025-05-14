import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonTitle,
  IonContent,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { PedidosService } from '../../servicios/pedidos.service';
import { Sales } from '../../interfaces/ventas.interface';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { CommonModule } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HighlightTextPipe } from 'src/app/shared/pipes/highlight-text.pipe';
import { map, Observable, startWith, tap } from 'rxjs';
import { DinamicSearchService } from 'src/app/shared/services/dinamic-search.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss'],
  imports: [
    sharedImports,
    IonButton,
    IonTitle,
    IonButtons,
    IonToolbar,
    IonContent,
    IonHeader,
    CommonModule,
    MatCard,
    ReactiveFormsModule,
    HighlightTextPipe,
  ],
})
export class PedidosComponent implements ViewWillEnter {
  carritoCount?: Observable<string>;
  formBusquedaPedidos = new FormControl('');
  pedidosCliente: Sales[] = [];
  filterPedidos$?: Observable<Sales[]>;

  constructor(
    private PedidosService: PedidosService,
    private dinamicSearchService: DinamicSearchService,
    private router: Router,
  ) {}

  ionViewWillEnter() {
    this.PedidosService.obtenerVentasCliente().subscribe(data => {
      this.pedidosCliente = data;
      this.filterPedidos();
    });
  }

  filterPedidos() {
    this.filterPedidos$ = this.formBusquedaPedidos.valueChanges.pipe(
      startWith(''),
      map(name => this.buscar(name || '')),
    );
  }

  buscar(name: string) {
    if (name) {
      return this.dinamicSearchService.dynamicSearch(this.pedidosCliente, name);
    }
    return this.pedidosCliente.slice();
  }

  irCarritoCompras() {
    this.router.navigate([`/carritoCompras`]);
  }
}
