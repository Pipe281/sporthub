import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { ProfileComponent } from './features/profile/pages/profile/profile.component';
import { adminGuard } from './core/guards/admin.guard';
import { AdminComponent } from './features/admin/pages/admin/admin.component';
import { ForgotPasswordComponent } from './features/auth/pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/pages/reset-password/reset-password.component';
import { NotFoundComponent } from './features/shared/pages/not-found/not-found.component';
import { CreateFacilityComponent } from './features/admin/pages/create-facility/create-facility.component';
import { FacilitiesComponent } from './features/facilities/pages/facilities/facilities.component';
import { AdminFacilitiesComponent } from './features/admin/pages/admin-facilities.component/admin-facilities.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [guestGuard],
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
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },
  {
    path: 'facilities',
    component: FacilitiesComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin/facilities/create',
    component: CreateFacilityComponent,
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin/facilities',
    component: AdminFacilitiesComponent,
    canActivate: [authGuard, adminGuard],
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
