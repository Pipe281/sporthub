import { computed, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { LoginRequest, RegisterRequest } from '../types/auth.types';
import { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // Estado interno del usuario autenticado.
  // Es privado para que solo AuthService pueda modificarlo.
  // Al iniciar la aplicación no hay ningún usuario cargado, por eso comienza en null.
  private readonly _currentUser = signal<User | null>(null);

  // Vista de solo lectura del usuario autenticado.
  // Otros componentes (Navbar, Profile, Guard, etc.) pueden consultar el usuario,
  // pero no pueden modificarlo gracias a asReadonly().
  readonly currentUser = this._currentUser.asReadonly();

  // Indica si existe un usuario autenticado.
  // No almacenamos este valor en otro signal porque puede calcularse automáticamente
  // a partir de currentUser. Si currentUser cambia, Angular recalcula este valor.
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  private get client(): SupabaseClient {
    return this.supabaseService.getClient();
  }

  async login(credentials: LoginRequest): Promise<void> {
    // Ignoramos `data` porque este método solo autentica al usuario.
    // La sesión y el usuario autenticado se obtendrán mediante
    // `getSession()` y `getCurrentUser()`.
    const { error } = await this.client.auth.signInWithPassword(credentials);

    if (error) {
      throw error;
    }
    await this.getCurrentUser();
  }

  async register(request: RegisterRequest): Promise<void> {
    const signUpRequest = {
      email: request.email,
      password: request.password,
      options: {
        data: {
          first_name: request.first_name,
          last_name: request.last_name,
          phone: request.phone,
        },
      },
    };

    const { error } = await this.client.auth.signUp(signUpRequest);

    if (error) {
      throw error;
    }
    await this.getCurrentUser();
  }

  async logout(): Promise<void> {
    const { error } = await this.client.auth.signOut();

    if (error) {
      throw error;
    }
    this._currentUser.set(null);
  }

  async getSession(): Promise<Session | null> {
    const { data, error } = await this.client.auth.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await this.client.auth.getUser();

    if (error) {
      throw error;
    }
    this._currentUser.set(data.user);

    return data.user;
  }
  async initializeAuth(): Promise<void> {
    const session = await this.getSession();
    console.log('initializeAuth iniciado');
    if (!session) {
      this._currentUser.set(null);
      console.log('No existe sesión.');
      return;
    }
    console.log('Session:', session);
    await this.getCurrentUser();
    console.log('Usuario autenticado:', this.currentUser());
  }

  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${environment.appUrl}/reset-password`,
    });

    if (error) {
      throw error;
    }
  }
  async updatePassword(password: string): Promise<void> {
    const { error } = await this.client.auth.updateUser({
      password,
    });

    if (error) {
      throw error;
    }
  }
}
