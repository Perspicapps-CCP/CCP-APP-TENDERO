import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./paginas/login/login.component').then(c => c.LoginComponent),
  },
  {
    path: 'changePassword',
    loadComponent: () =>
      import('./paginas/change-password/change-password.component').then(
        c => c.ChangePasswordComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
