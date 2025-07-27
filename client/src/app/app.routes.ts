import { Routes } from '@angular/router';
import { CreateAdminPageComponent } from './pages/admin/create-admin/create-admin.component';

export const routes: Routes = [
  {
    path: 'admin',
    children: [
      {
        path: 'create-admin',
        component: CreateAdminPageComponent
      }
    ]
  }
];
