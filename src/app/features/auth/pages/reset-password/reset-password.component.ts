import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly loading = signal(false);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  readonly resetPasswordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  async resetPassword(): Promise<void> {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    const form = this.resetPasswordForm.getRawValue();

    if (form.password !== form.confirmPassword) {
      this.notificationService.warning('Las contraseñas no coinciden.');

      return;
    }

    try {
      this.loading.set(true);

      await this.authService.updatePassword(form.password);

      this.notificationService.success(
        'Contraseña actualizada. Inicia sesión con tu nueva contraseña.',
      );
      // Cerrar la sesión temporal creada por Supabase.
      await this.authService.logout();
      console.log('Antes de navegar');

      await this.router.navigate(['/login']);

      console.log('Después de navegar');
    } catch (error) {
      console.error(error);

      this.notificationService.error('No fue posible actualizar la contraseña.');
    } finally {
      this.loading.set(false);
    }
  }
}
