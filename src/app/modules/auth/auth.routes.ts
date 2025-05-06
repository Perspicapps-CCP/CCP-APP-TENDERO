import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./paginas/login/login.component').then(c => c.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./paginas/register/register.component').then(c => c.RegisterComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
