import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ProfileService } from '../services/profile.service';

export const adminGuard: CanActivateFn = async () => {
  const profileService = inject(ProfileService);
  const router = inject(Router);

  try {
    const profile = await profileService.getProfile();

    if (profile.role === 'ADMIN') {
      return true;
    }

    return router.createUrlTree(['/profile']);
  } catch {
    return router.createUrlTree(['/login']);
  }
};
