import { Routes } from '@angular/router';

export const CATALOGO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paginas/catalogo/catalogo.component').then(c => c.CatalogoComponent),
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
];
