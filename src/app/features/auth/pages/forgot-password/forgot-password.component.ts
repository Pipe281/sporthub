import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  readonly loading = signal(false);

  readonly forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  async sendRecoveryEmail(): Promise<void> {
    if (this.forgotPasswordForm.invalid) {
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
