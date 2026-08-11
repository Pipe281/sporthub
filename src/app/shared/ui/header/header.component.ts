import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { NavigationItem } from '../../../core/interfaces/navigation-item.interface';
import { AuthService } from '../../../core/services/auth.service';
import { NavigationService } from '../../../core/services/navigation.service';
import {
  AUTH_ROUTES,
  CUSTOMER_ROUTES,
  ADMIN_ROUTES,
  PUBLIC_AUTH_ROUTES,
} from '../../../core/constants/app-routes.constants';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  // Dependencias
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);
  private readonly profileService = inject(ProfileService);

  //Menu Hamburguesa
  private readonly _menuOpen = signal(false);
  readonly menuOpen = this._menuOpen.asReadonly();
  toggleMenu(): void {
    this._menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this._menuOpen.set(false);
  }
  // Rutas disponibles para el HTML
  readonly profile = this.profileService.profile;
  protected readonly ROUTES = CUSTOMER_ROUTES;
  protected readonly customerNavigationItems: readonly NavigationItem[] = [
    {
      label: 'Inicio',
      route: CUSTOMER_ROUTES.DASHBOARD,
      icon: 'home',
    },
    {
      label: 'Instalaciones',
      route: CUSTOMER_ROUTES.FACILITIES,
      icon: 'fitness_center',
    },
    {
      label: 'Mis reservas',
      route: CUSTOMER_ROUTES.RESERVATIONS,
      icon: 'event',
    },
    {
      label: 'Mi perfil',
      route: CUSTOMER_ROUTES.PROFILE,
      icon: 'person',
    },
  ];
  protected readonly adminNavigationItems: readonly NavigationItem[] = [
    {
      label: 'Dashboard',
      route: ADMIN_ROUTES.DASHBOARD,
      icon: 'dashboard',
    },
    {
      label: 'Clientes',
      route: ADMIN_ROUTES.CLIENTS,
      icon: 'group',
    },
    {
      label: 'Instalaciones',
      route: ADMIN_ROUTES.FACILITIES,
      icon: 'fitness_center',
    },
    {
      label: 'Calendario',
      route: ADMIN_ROUTES.SCHEDULES,
      icon: 'schedule',
    },
    {
      label: 'Tipos',
      route: ADMIN_ROUTES.FACILITY_TYPES,
      icon: 'category',
    },
    {
      label: 'Mi perfil',
      route: ADMIN_ROUTES.PROFILE,
      icon: 'person',
    },
  ];
  readonly navigationItems = computed(() => {
    const profile = this.profile();

    if (!profile) {
      return [];
    }

    return profile.role === 'ADMIN' ? this.adminNavigationItems : this.customerNavigationItems;
  });

  async logout(): Promise<void> {
    try {
      await this.authService.logout();

      // Limpiar el perfil almacenado
      this.profileService.clearProfile();

      await this.router.navigate([AUTH_ROUTES.LOGIN]);
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
