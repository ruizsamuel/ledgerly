import { Routes } from "@angular/router";

export const TRANSACTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./transactions.component').then(c => c.TransactionsComponent),
  }
];
