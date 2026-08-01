import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { NavigationService } from '../services/navigation.service';
import { ProfileService } from '../services/profile.service';

export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const navigationService = inject(NavigationService);
  const profileService = inject(ProfileService);
  const router = inject(Router);

  const session = await authService.getSession();

  // No existe una sesión activa.
  // El usuario puede acceder a las rutas públicas.
  if (!session) {
    return true;
  }

  // El usuario ya tiene una sesión activa.
  // Si existe una última ruta protegida, volver a ella.
  const lastProtectedRoute = navigationService.lastProtectedRoute();

  if (lastProtectedRoute) {
    return router.createUrlTree([lastProtectedRoute]);
  }

  // Si no existe una ruta protegida almacenada,
  // navegar según el rol del usuario.
  const profile = await profileService.getProfile();

  if (profile.role === 'ADMIN') {
    return router.createUrlTree(['/admin']);
  }

  return router.createUrlTree(['/profile']);
};
