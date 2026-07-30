import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly registerForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  async register(): Promise<void> {
    if (this.registerForm.invalid) {
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
      this.successMessage.set('Cuenta creada correctamente. Ahora puedes iniciar sesión.');

      await this.router.navigate(['/login']);
    } catch (error: any) {
      if (error.message?.toLowerCase().includes('already')) {
        this.errorMessage.set('Ya existe una cuenta con este correo.');
      } else {
        this.errorMessage.set('No fue posible crear la cuenta.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
