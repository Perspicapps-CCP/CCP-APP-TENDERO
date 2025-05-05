import { Routes } from '@angular/router';

export const ENTREGAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paginas/entregas/entregas.component').then(c => c.EntregasComponent),
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
];
