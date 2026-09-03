import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TextInputComponent } from '../../../../shared/ui/text-input/text-input.component';
import { AuthLayoutComponent } from '../../../../shared/ui/auth-layout/auth-layout.component';
import { ButtonComponent } from '../../../../shared/ui/botton/button.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TextInputComponent,
    AuthLayoutComponent,
    ButtonComponent,
    RouterLink,
  ],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  readonly loading = signal(false);

  readonly forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  showDisabledMessage(): void {
    this.notificationService.info('Recuperar contraseña está deshabilitado por el administrador.');
  }

  async sendRecoveryEmail(): Promise<void> {
    this.showDisabledMessage();
    return;

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    try {
      this.loading.set(true);
      const { email } = this.forgotPasswordForm.getRawValue();

      await this.authService.requestPasswordReset(email);

      this.notificationService.success(
        'Si existe una cuenta asociada a ese correo, te hemos enviado un enlace para restablecer tu contraseña.',
      );

      this.forgotPasswordForm.reset();
    } catch (error) {
      console.error(error);

      this.notificationService.error('No fue posible procesar la solicitud.');
    } finally {
      this.loading.set(false);
    }
  }
}
