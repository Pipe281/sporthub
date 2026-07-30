import { Component, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../../../core/services/profile.service';
import { Profile } from '../../../../core/types/profile.types';

@Component({
  selector: 'profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly profile = signal<Profile | null>(null);
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
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
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
      await this.loadProfile();
      this.editing.set(false);
      // TODO: Mostrar notificación de éxito.
      alert('Perfil actualizado correctamente.');
    } catch (error) {
      console.error(error);
      // TODO: Mostrar notificación de error.
      alert('No fue posible actualizar el perfil.');
    }
  }
  private async loadProfile(): Promise<void> {
    const profile = await this.profileService.getProfile();

    this.profile.set(profile);

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

    const profile = this.profile();

    if (!profile) return;

    this.profileForm.patchValue({
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone ?? '',
    });
  }
}
