import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { NavigationService } from '../services/navigation.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const navigationService = inject(NavigationService);

  const session = await authService.getSession();

  if (session) {
    return true;
  }

  // Guardar la ruta que el usuario intentó visitar.
  navigationService.setReturnUrl(state.url);
  return router.createUrlTree(['/login']);
};
