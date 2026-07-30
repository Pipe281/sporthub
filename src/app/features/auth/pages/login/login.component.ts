import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

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
      // Navegar
      await this.router.navigate(['/profile']);
    } catch {
      // Mostrar error
      this.errorMessage.set('Correo o contraseña incorrectos.');
    } finally {
      this.loading.set(false);
    }
  }
}
