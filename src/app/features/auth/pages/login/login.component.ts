import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProfileComponent } from '../../../profile/pages/profile/profile.component';

import { AuthService } from '../../../../core/services/auth.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { NavigationService } from '../../../../core/services/navigation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  // Dependencias
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly profileService = inject(ProfileService);
  private readonly navigationService = inject(NavigationService);

  // Estado UI
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  // Estado del formulario
  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async login(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }
    try {
      this.loading.set(true);
      this.errorMessage.set('');
      // Obtener credenciales
      const credentials = this.loginForm.getRawValue();
      // Llamar a AuthService
      await this.authService.login(credentials);
      // Si el usuario intentó acceder previamente a una ruta protegida, volver a esa ubicación una vez autenticado.
      const returnUrl = this.navigationService.returnUrl();

      if (returnUrl) {
        // La ruta ya fue utilizada, por lo que se elimina para evitar reutilizarla en futuros inicios de sesión.
        this.navigationService.clearReturnUrl();
        await this.router.navigateByUrl(returnUrl);

        return;
      }
      // Navegar
      const profile = await this.profileService.getProfile();
      if (profile.role === 'CUSTOMER') {
        await this.router.navigate(['/profile']);
      } else {
        await this.router.navigate(['/admin']);
      }
    } catch {
      // Mostrar error
      this.errorMessage.set('Correo o contraseña incorrectos.');
    } finally {
      this.loading.set(false);
    }
  }
}
