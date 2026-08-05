import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/ui/botton/button.component';

import {
  AUTH_ROUTES,
  ADMIN_ROUTES,
  CUSTOMER_ROUTES,
} from '../../../../core/constants/app-routes.constants';

import { AuthService } from '../../../../core/services/auth.service';
import { ProfileService } from '../../../../core/services/profile.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);

  protected readonly AUTH_ROUTES = AUTH_ROUTES;

  async goToHome(): Promise<void> {
    const session = await this.authService.getSession();

    if (!session) {
      await this.router.navigateByUrl(AUTH_ROUTES.LOGIN);
      return;
    }

    const profile = await this.profileService.getProfile();

    if (profile.role === 'ADMIN') {
      await this.router.navigateByUrl(ADMIN_ROUTES.DASHBOARD);
      return;
    }

    await this.router.navigateByUrl(CUSTOMER_ROUTES.PROFILE);
  }
}
