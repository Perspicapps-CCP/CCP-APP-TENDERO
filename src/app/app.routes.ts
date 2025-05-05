import { Routes } from '@angular/router';
import { LayoutComponent } from './modules/layout/paginas/layout/layout.component';
import { validateTokenGuard } from './shared/guards/validate-token.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'home',
    component: LayoutComponent,
    canActivate: [validateTokenGuard],
    canActivateChild: [validateTokenGuard],
    children: [
      {
        path: 'catalogo',
        loadChildren: () =>
          import('./modules/catalogo/catalogo.routes').then(m => m.CATALOGO_ROUTES),
      },
      {
        path: 'pedidos',
        loadChildren: () => import('./modules/pedidos/pedidos.routes').then(m => m.PEDIDOS_ROUTES),
      },
      {
        path: 'entregas',
        loadChildren: () =>
          import('./modules/entregas/entregas.routes').then(m => m.ENTREGAS_ROUTES),
      },
      {
        path: 'perfil',
        loadChildren: () => import('./modules/perfil/perfil.routes').then(m => m.PERFIL_ROUTES),
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
