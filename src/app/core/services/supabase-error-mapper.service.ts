import { Injectable } from '@angular/core';

const RESERVATION_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  RESERVATION_TIME_IS_NO_LONGER_AVAILABLE:
    'El horario seleccionado ya no está disponible. Selecciona otro horario.',
  RESERVATION_OUTSIDE_OPERATING_HOURS:
    'El horario seleccionado está fuera del horario de funcionamiento. Selecciona otro horario.',
  FACILITY_IS_NOT_AVAILABLE:
    'La instalación no está disponible actualmente. Selecciona otra instalación o intenta más tarde.',
  RESERVATION_CAN_ONLY_BE_CANCELLED_2_HOURS_BEFORE_START:
    'La reserva solo puede cancelarse hasta 2 horas antes de su inicio.',
  CANCELLATION_TOO_LATE: 'La reserva solo puede cancelarse hasta 2 horas antes de su inicio.',
  TWO_HOURS: 'La reserva solo puede cancelarse hasta 2 horas antes de su inicio.',
  MINIMUM_CANCELLATION: 'La reserva solo puede cancelarse hasta 2 horas antes de su inicio.',
  NOT_CONFIRMED: 'Solo puedes cancelar reservas confirmadas.',
  NOT_FOUND: 'No fue posible encontrar una reserva cancelable.',
  NOT_OWNER: 'No fue posible encontrar una reserva cancelable.',
  AUTHENTICATION_REQUIRED: 'Tu sesión ya no está activa. Inicia sesión nuevamente.',
  USER_IS_NOT_AN_ACTIVE_CUSTOMER: 'Tu cuenta no está habilitada para realizar reservas.',
};

const DEFAULT_RESERVATION_ERROR = 'No fue posible completar la operación. Inténtalo nuevamente.';
const DEFAULT_AUTH_ERROR = 'No fue posible completar la operación de autenticación.';
const DEFAULT_FACILITY_ERROR = 'No fue posible guardar la información de la instalación.';
const DEFAULT_STORAGE_ERROR = 'No fue posible cargar la imagen. Inténtalo nuevamente.';

const AUTH_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
  INVALID_LOGIN_CREDENTIALS: 'Correo o contraseña incorrectos.',
  USER_ALREADY_EXISTS: 'Ya existe una cuenta con este correo.',
  EMAIL_EXISTS: 'Ya existe una cuenta con este correo.',
  WEAK_PASSWORD: 'La contraseña no cumple con los requisitos de seguridad.',
  EMAIL_NOT_CONFIRMED: 'Debes confirmar tu correo antes de iniciar sesión.',
  SESSION_NOT_FOUND: 'Tu sesión ya no está activa. Inicia sesión nuevamente.',
  REFRESH_TOKEN_NOT_FOUND: 'Tu sesión expiró. Inicia sesión nuevamente.',
  OVER_REQUEST_RATE_LIMIT: 'Demasiadas solicitudes. Espera unos minutos e inténtalo nuevamente.',
};

const DATABASE_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  '23505': 'Ya existe un registro con esos datos.',
  '23503': 'No se puede completar la operación porque existen datos relacionados.',
  '42501': 'No tienes permisos suficientes para realizar esta operación.',
  PGRST116: 'No se encontró el registro solicitado.',
};

const STORAGE_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  FILE_SIZE_LIMIT: 'La imagen supera el tamaño máximo permitido.',
  INVALID_FILE_TYPE: 'El formato de la imagen no está permitido.',
  BUCKET_NOT_FOUND: 'No fue posible acceder al almacenamiento de imágenes.',
};

@Injectable({ providedIn: 'root' })
export class SupabaseErrorMapper {
  mapReservationError(error: unknown): string {
    return this.findMessage(error, RESERVATION_ERROR_MESSAGES, DEFAULT_RESERVATION_ERROR);
  }

  mapAuthError(error: unknown): string {
    const normalizedError = this.getErrorText(error).toUpperCase();
    const message = this.findMessage(error, AUTH_ERROR_MESSAGES, DEFAULT_AUTH_ERROR);

    if (message !== DEFAULT_AUTH_ERROR) {
      return message;
    }

    return normalizedError.includes('ALREADY')
      ? AUTH_ERROR_MESSAGES['USER_ALREADY_EXISTS']
      : message;
  }

  mapFacilityError(error: unknown): string {
    const storageMessage = this.findMessage(error, STORAGE_ERROR_MESSAGES, '');

    return storageMessage || this.mapDatabaseError(error, DEFAULT_FACILITY_ERROR);
  }

  mapStorageError(error: unknown): string {
    return this.findMessage(error, STORAGE_ERROR_MESSAGES, DEFAULT_STORAGE_ERROR);
  }

  mapDatabaseError(error: unknown, fallback = 'No fue posible completar la operación.'): string {
    return this.findMessage(error, DATABASE_ERROR_MESSAGES, fallback);
  }

  private findMessage(
    error: unknown,
    messages: Readonly<Record<string, string>>,
    fallback: string,
  ): string {
    const normalizedError = this.getErrorText(error).toUpperCase();

    for (const [code, message] of Object.entries(messages)) {
      if (normalizedError.includes(code)) {
        return message;
      }
    }

    return fallback;
  }

  private getErrorText(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'object' && error !== null) {
      const errorRecord = error as Record<string, unknown>;

      return ['code', 'message', 'details', 'hint']
        .map((property) => errorRecord[property])
        .filter((value): value is string => typeof value === 'string')
        .join(' ');
    }

    return typeof error === 'string' ? error : '';
  }
}
