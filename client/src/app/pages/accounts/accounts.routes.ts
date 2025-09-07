import { Routes } from "@angular/router";

export const ACCOUNTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./accounts.component').then(c => c.AccountsComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./detail/account-detail.component').then(c => c.AccountDetailComponent),
  }
];
