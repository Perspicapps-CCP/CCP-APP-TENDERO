import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  ViewWillEnter,
  ViewWillLeave,
} from '@ionic/angular/standalone';
import { UsuarioService } from 'src/app/modules/auth/servicios/usuario.service';
import { CarritoComprasService } from 'src/app/modules/carrito-compras/servicios/carrito-compras.service';
import { CatalogoService } from 'src/app/modules/carrito-compras/servicios/catalogo.service';
import { InventorySocketServiceService } from 'src/app/modules/carrito-compras/servicios/inventory-socket-service.service';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { HighlightTextPipe } from 'src/app/shared/pipes/highlight-text.pipe';
import { Producto } from '../../interfaces/productos.interface';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { DinamicSearchService } from 'src/app/shared/services/dinamic-search.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss'],
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
export class CatalogoComponent implements ViewWillEnter, ViewWillLeave {
  // Variables para el catálogo de productos
  productos: Producto[] = [];
  formBusquedaProductos = new FormControl('');
  filterProductos$?: Observable<Producto[]>;
  carritoCount?: Observable<string>;

  private subscriptionChangeInventory?: Subscription;

  constructor(
    private inventorySocketServiceService: InventorySocketServiceService,
    private carritoComprasService: CarritoComprasService,
    private usuarioService: UsuarioService,
    private catalogoService: CatalogoService,
    private dinamicSearchService: DinamicSearchService,
    private router: Router,
  ) {}

  ionViewWillEnter() {
    this.carritoComprasService.setCurrentClient(this.usuarioService.usuario?.user?.id!);
    this.carritoCount = this.carritoComprasService.getCartItemCount();
    this.obtenerProductos();
    this.connectionChangeInventory();
  }

  obtenerProductos() {
    this.catalogoService.obtenerProductos().subscribe(res => {
      this.productos = res;
      this.filterProductos();
    });
  }

  filterProductos() {
    this.filterProductos$ = this.formBusquedaProductos.valueChanges.pipe(
      startWith(''),
      map(name => this.buscar(name || '')),
    );
  }

  buscar(name: string) {
    if (name) {
      return this.dinamicSearchService.dynamicSearch(this.productos, name);
    }
    return this.productos.slice();
  }

  connectionChangeInventory() {
    this.subscriptionChangeInventory =
      this.inventorySocketServiceService.inventoryChange$.subscribe(event => {
        if (event) {
          const { product_id, quantity } = event;
          const indexProduct = this.productos.findIndex(
            producto => producto.product_id === product_id,
          );
          if (indexProduct !== -1) {
            this.productos[indexProduct].quantity = quantity;
          }
        }
      });
  }

  ionViewWillLeave() {
    if (this.subscriptionChangeInventory) {
      this.subscriptionChangeInventory.unsubscribe();
    }
  }

  irCarritoCompras() {
    this.router.navigate([`/carrito-compras`]);
  }

  irDetalleProducto(producto: Producto) {
    this.catalogoService.productoSeleccionado = producto;

    this.router.navigate(['/carrito-compras', producto.product_id]);
  }

  agregarAlCarrito(producto: Producto) {
    this.carritoComprasService.addToCurrentCart(producto);
    producto.quantity_selected = 0;
  }
}
