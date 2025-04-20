import { Routes } from '@angular/router';

export const VISITAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paginas/visitas/visitas.component').then(c => c.VisitasComponent),
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
];
