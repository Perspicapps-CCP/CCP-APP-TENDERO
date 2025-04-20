import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paginas/clientes/clientes.component').then(c => c.ClientesComponent),
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
];
