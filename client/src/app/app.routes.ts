import { Routes } from '@angular/router';
import { authGuard } from './core/providers/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(c => c.DashboardComponent)
      },
      {
        path: 'accounts',
        loadChildren: () => import('./pages/accounts/accounts.routes').then(r => r.ACCOUNTS_ROUTES)
      },
      {
        path: 'transactions',
        loadChildren: () => import('./pages/transactions/transactions.routes').then(r => r.TRANSACTIONS_ROUTES)
      },
      {
        path: 'reports',
        loadChildren: () => import('./pages/reports/reports.routes').then(r => r.REPORTS_ROUTES)
      },
      {
        path: 'admin',
        loadChildren: () => import('./pages/admin/admin.routes').then(r => r.ADMIN_ROUTES)
      },
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  }
];
