import { Routes } from '@angular/router';
import { LayoutComponent } from './modules/layout/paginas/layout/layout.component';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'home',
    component: LayoutComponent,
    // canActivate: [validateTokenGuard],
    // canActivateChild: [validateTokenGuard],
    children: [
      {
        path: 'clientes',
        loadChildren: () =>
          import('./modules/clientes/clientes.routes').then(m => m.CLIENTES_ROUTES),
      },
      {
        path: 'visitas',
        loadChildren: () => import('./modules/visitas/visitas.routes').then(m => m.VISITAS_ROUTES),
      },
      {
        path: 'rutas',
        loadChildren: () => import('./modules/rutas/rutas.routes').then(m => m.RUTAS_ROUTES),
      },
      {
        path: '',
        redirectTo: 'clientes',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
