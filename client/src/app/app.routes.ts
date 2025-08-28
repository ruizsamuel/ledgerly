import { Routes } from '@angular/router';
import { authGuard } from './core/providers/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      //{
      //  path: 'dashboard',
      //  // TODO: Dashboard
      //},
      {
        path: 'accounts',
        loadChildren: () => import('./pages/accounts/accounts.routes').then(r => r.ACCOUNTS_ROUTES)
      },
      //{
      //  path: '**',
      //  redirectTo: 'dashboard'
      //}
    ]
  }
];
