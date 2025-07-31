import { Routes } from '@angular/router';
import { authGuard } from './core/providers/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: []
  }
];
