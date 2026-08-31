import { Component, input, signal, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.scss',
})
export class TextInputComponent {
  readonly inputId = input('');
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly type = input<'text' | 'email' | 'password' | 'tel' | 'number'>('text');
  readonly control = input.required<FormControl>();
  readonly showPassword = signal(false);

  readonly inputType = computed(() => {
    if (this.type() !== 'password') {
      return this.type();
    }

    return this.showPassword() ? 'text' : 'password';
  });

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }
  get errorMessage(): string {
    const control = this.control();

    if (!(control.touched || control.dirty)) {
      return '';
    }

    if (!control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio.';
    }

    if (control.errors['email']) {
      return 'Ingrese un correo electrónico válido.';
    }

    if (control.errors['minlength']) {
      return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
    }

    if (control.errors['pattern']) {
      return 'El formato ingresado no es válido.';
    }

    return 'Campo inválido.';
  }
}
