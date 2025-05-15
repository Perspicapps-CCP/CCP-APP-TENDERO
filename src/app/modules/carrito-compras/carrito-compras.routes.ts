import { Routes } from '@angular/router';

export const CARRITO_COMPRAS_ROUTES: Routes = [
  {
    path: 'carrito-compras',
    loadComponent: () =>
      import('./paginas/carrito-compras/carrito-compras.component').then(
        c => c.CarritoComprasComponent,
      ),
  },
];
