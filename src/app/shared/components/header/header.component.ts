import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { NavigationService } from '../../../core/services/navigation.service';
import { PUBLIC_AUTH_ROUTES } from '../../../core/constants/app-routes.constants';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  // Dependencias
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
  readonly showHeader = computed(() => {
    const currentUrl = this.navigationService.currentRoute();

    return (
      this.authService.isAuthenticated() &&
      !PUBLIC_AUTH_ROUTES.includes(currentUrl as (typeof PUBLIC_AUTH_ROUTES)[number])
    );
  });
}
