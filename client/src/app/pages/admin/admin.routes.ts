import { Routes } from "@angular/router";
import { adminGuard } from "../../core/providers/auth.guard";

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin.component').then(c => c.AdminComponent),
  }
]
