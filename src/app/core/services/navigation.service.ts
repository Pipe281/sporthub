import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  // Ruta actual de la aplicación.
  private readonly _currentRoute = signal('/');

  readonly currentRoute = this._currentRoute.asReadonly();

  setCurrentRoute(route: string): void {
    this._currentRoute.set(route);
  }

  // Última ruta protegida visitada por el usuario.
  private readonly _lastProtectedRoute = signal<string | null>(null);

  readonly lastProtectedRoute = this._lastProtectedRoute.asReadonly();

  setLastProtectedRoute(route: string): void {
    this._lastProtectedRoute.set(route);
  }

  clearLastProtectedRoute(): void {
    this._lastProtectedRoute.set(null);
  }

  // Ruta a la que debe volver el usuario después del login.
  private readonly _returnUrl = signal<string | null>(null);

  readonly returnUrl = this._returnUrl.asReadonly();

  setReturnUrl(url: string): void {
    this._returnUrl.set(url);
  }

  clearReturnUrl(): void {
    this._returnUrl.set(null);
  }
}
