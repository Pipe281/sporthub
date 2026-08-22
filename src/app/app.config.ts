import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { ProfileService } from './core/services/profile.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    provideAppInitializer(async () => {
      const authService = inject(AuthService);
      const profileService = inject(ProfileService);

      await authService.initializeAuth();

      if (authService.isAuthenticated()) {
        await profileService.loadProfile();
      }
    }),
  ],
};
