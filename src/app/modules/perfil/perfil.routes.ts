import { Routes } from '@angular/router';

export const PERFIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./paginas/perfil/perfil.component').then(c => c.PerfilComponent),
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
];
