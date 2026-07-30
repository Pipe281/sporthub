import { Injectable, inject } from '@angular/core';

import { AuthService } from './auth.service';
import { SupabaseService } from './supabase.service';

import { Profile, UpdateProfileRequest } from '../types/profile.types';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly supabase = inject(SupabaseService);
  private readonly authService = inject(AuthService);

  async getProfile(): Promise<Profile> {
    const session = await this.authService.getSession();

    if (!session) {
      throw new Error('No existe una sesión activa.');
    }

    const { data, error } = await this.supabase
      .getClient()
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      throw error;
    }

    return data as Profile;
  }

  async updateProfile(request: UpdateProfileRequest): Promise<void> {
    const session = await this.authService.getSession();

    if (!session) {
      throw new Error('No existe una sesión activa.');
    }

    const { error } = await this.supabase
      .getClient()
      .from('profiles')
      .update(request)
      .eq('id', session.user.id);

    if (error) {
      throw error;
    }
  }
}
