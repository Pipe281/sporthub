import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { ProfileComponent } from './features/profile/pages/profile/profile.component';
import { adminGuard } from './core/guards/admin.guard';
import { AdminComponent } from './features/admin/pages/admin/admin.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, adminGuard],
  },
];
