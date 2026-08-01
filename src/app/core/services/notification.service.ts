import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  // Clases CSS utilizadas para personalizar cada tipo de notificación.
  private static readonly SUCCESS_CLASS = 'success-snackbar';
  private static readonly ERROR_CLASS = 'error-snackbar';
  private static readonly WARNING_CLASS = 'warning-snackbar';
  private static readonly INFO_CLASS = 'info-snackbar';

  success(message: string): void {
    this.show(message, NotificationService.SUCCESS_CLASS);
  }

  error(message: string): void {
    this.show(message, NotificationService.ERROR_CLASS);
  }

  warning(message: string): void {
    this.show(message, NotificationService.WARNING_CLASS);
  }

  info(message: string): void {
    this.show(message, NotificationService.INFO_CLASS);
  }

  private show(message: string, panelClass: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [panelClass],
    });
  }
}
