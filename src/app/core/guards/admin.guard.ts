import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { NotificationService } from '../services/notification.service';
import { ProfileService } from '../services/profile.service';

import { AUTH_ROUTES, CUSTOMER_ROUTES } from '../constants/app-routes.constants';

export const adminGuard: CanActivateFn = async () => {
  const profileService = inject(ProfileService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  try {
    const profile = await profileService.getProfile();

    if (profile.role === 'ADMIN') {
      return true;
    }

    notificationService.error('❌ No tienes permisos para acceder a esta sección.');

    return router.createUrlTree([CUSTOMER_ROUTES.PROFILE]);
  } catch {
    notificationService.info('Debes iniciar sesión para acceder a esta sección.');

    return router.createUrlTree([AUTH_ROUTES.LOGIN]);
  }
};
