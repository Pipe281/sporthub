import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { SupabaseErrorMapper } from '../../../../core/services/supabase-error-mapper.service';
import { NavigationService } from '../../../../core/services/navigation.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ButtonComponent } from '../../../../shared/ui/botton/button.component';
import { AuthLayoutComponent } from '../../../../shared/ui/auth-layout/auth-layout.component';
import { TextInputComponent } from '../../../../shared/ui/text-input/text-input.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    RouterLink,
    AuthLayoutComponent,
    TextInputComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);
  private readonly profileService = inject(ProfileService);
  private readonly errorMapper = inject(SupabaseErrorMapper);
  private readonly notificationService = inject(NotificationService);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly registerForm = this.fb.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^[0-9]*$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  showDisabledMessage(): void {
    this.notificationService.info('Crear una nueva cuenta está deshabilitado por el administrador.');
  }

  async register(): Promise<void> {
    this.showDisabledMessage();
    return;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const form = this.registerForm.getRawValue();

    if (form.password !== form.confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    try {
      this.loading.set(true);
      this.errorMessage.set('');
      const { confirmPassword, ...request } = form;
      await this.authService.register(request);
      this.successMessage.set('Cuenta creada correctamente.');
      // Si el usuario intentó acceder previamente a una ruta protegida,
      // volver a esa ubicación una vez autenticado.
      const returnUrl = this.navigationService.returnUrl();

      if (returnUrl !== null) {
        // La ruta ya fue utilizada, por lo que se elimina para evitar
        // reutilizarla en futuros registros o inicios de sesión.
        this.navigationService.clearReturnUrl();
        await this.router.navigateByUrl(returnUrl!);
        return;
      }

      const profile = await this.profileService.getProfile();

      if (profile.role === 'CUSTOMER') {
        await this.router.navigate(['/profile']);
      } else {
        await this.router.navigate(['/admin']);
      }
    } catch (error: unknown) {
      console.error('Error al registrar la cuenta:', error);
      this.errorMessage.set(this.errorMapper.mapAuthError(error));
    } finally {
      this.loading.set(false);
    }
  }
}
