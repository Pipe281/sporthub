import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from './core/services/auth.service';
import { HeaderComponent } from './shared/ui/header/header.component';
import { NavigationService } from './core/services/navigation.service';
import { PUBLIC_AUTH_ROUTES } from './core/constants/app-routes.constants';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);

  ngOnInit(): void {
    void this.authService.initializeAuth();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        // Mantener actualizada la ruta donde se encuentra el usuario.
        this.navigationService.setCurrentRoute(event.urlAfterRedirects);

        // Guardar únicamente la última ruta protegida.
        if (
          !PUBLIC_AUTH_ROUTES.includes(
            event.urlAfterRedirects as (typeof PUBLIC_AUTH_ROUTES)[number],
          )
        ) {
          this.navigationService.setLastProtectedRoute(event.urlAfterRedirects);
        }
      });
  }
}
