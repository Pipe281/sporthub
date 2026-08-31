import { Injectable, inject, signal } from '@angular/core';

import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

import { Profile, UpdateProfileRequest } from '../types/profile.types';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly supabase = inject(SupabaseService);
  private readonly authService = inject(AuthService);

  private readonly _profile = signal<Profile | null>(null);

  readonly profile = this._profile.asReadonly();

  async getProfile(): Promise<Profile> {
    if (!this.profile()) {
      await this.loadProfile();
    }

    return this.profile()!;
  }

  async loadProfile(): Promise<void> {
    const userId = await this.getCurrentUserId();

    const { data, error } = await this.supabase
      .getClient()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    this._profile.set(data as Profile);
  }

  async updateProfile(request: UpdateProfileRequest): Promise<void> {
    const userId = await this.getCurrentUserId();

    const { error } = await this.supabase
      .getClient()
      .from('profiles')
      .update(request)
      .eq('id', userId);

    if (error) {
      throw error;
    }

    // Mantener sincronizado el estado compartido
    await this.loadProfile();
  }

  clearProfile(): void {
    this._profile.set(null);
  }

  private async getCurrentUserId(): Promise<string> {
    const session = await this.authService.getSession();

    if (!session) {
      throw new Error('No existe una sesión activa.');
    }

    return session.user.id;
  }
}
