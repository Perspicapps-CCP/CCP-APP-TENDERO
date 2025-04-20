import { Routes } from '@angular/router';

export const RUTAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./paginas/rutas/rutas.component').then(c => c.RutasComponent),
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
];
