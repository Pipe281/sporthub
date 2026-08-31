import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { NavigationService } from '../services/navigation.service';

export const authGuard: CanActivateFn = async (_, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const navigationService = inject(NavigationService);

  if (authService.isAuthenticated()) {
    return true;
  }
  // Guardar la ruta que el usuario intentó visitar.
  navigationService.setReturnUrl(state.url);
  return router.createUrlTree(['/login']);
};
