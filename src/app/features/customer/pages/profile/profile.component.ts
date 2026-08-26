import { Component, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NotificationService } from '../../../../core/services/notification.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { TextInputComponent } from '../../../../shared/ui/text-input/text-input.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ButtonComponent } from '../../../../shared/ui/botton/button.component';

@Component({
  selector: 'profile',
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent, ButtonComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;
  // Estado compartido
  readonly profile = this.profileService.profile;

  // Estado de la vista
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly editing = signal(false);

  readonly profileForm = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    phone: [''],
  });

  async ngOnInit(): Promise<void> {
    this.loading.set(true);

    try {
      await this.loadProfile();
    } catch {
      this.errorMessage.set('No fue posible cargar el perfil.');
    } finally {
      this.loading.set(false);
    }
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      return;
    }

    try {
      await this.profileService.updateProfile(this.profileForm.getRawValue());

      // updateProfile() ya actualiza el signal
      this.patchForm();

      this.editing.set(false);

      this.notificationService.success('Perfil actualizado correctamente.');
    } catch {
      this.notificationService.error('No fue posible actualizar el perfil.');
    }
  }

  private async loadProfile(): Promise<void> {
    await this.profileService.getProfile();

    this.patchForm();
  }

  private patchForm(): void {
    const profile = this.profile();

    if (!profile) {
      return;
    }

    this.profileForm.patchValue({
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone ?? '',
    });
  }

  startEditing(): void {
    this.editing.set(true);
  }

  cancelEditing(): void {
    this.editing.set(false);

    this.patchForm();
  }
}
