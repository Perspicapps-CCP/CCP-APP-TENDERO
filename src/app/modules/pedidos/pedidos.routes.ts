import { Routes } from '@angular/router';

export const PEDIDOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paginas/pedidos/pedidos.component').then(c => c.PedidosComponent),
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
];
