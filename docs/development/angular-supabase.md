# SportHub - Integración Angular + Supabase

## 1. Objetivo

Este documento define cómo Angular debe comunicarse con Supabase.

La aplicación utiliza el SDK oficial de Supabase para:

* Autenticación.
* Consultas.
* RPC.
* Gestión de sesión.

---

# 2. Configuración

Las credenciales deben almacenarse mediante variables de entorno.

Ejemplo:

```text
environment.ts
```

```typescript
export const environment = {
  production: false,

  supabaseUrl: 'https://djugeltwqubmmhjrpqkw.supabase.co',

  supabaseAnonKey: 'TU_SUPABASE_ANON_KEY',
};
```

Nunca se debe incluir:

```text
service_role key
```

en Angular.

La `service_role key` nunca debe exponerse en el frontend.

---

# 3. Cliente Supabase

La aplicación debe tener un único cliente Supabase.

Se recomienda crear un servicio:

```text
SupabaseService
```

Responsabilidades:

* Inicializar el cliente.
* Exponer el cliente a los servicios de dominio.
* Centralizar la configuración.

No se debe crear una instancia nueva del cliente en cada servicio.

---

# 4. Arquitectura Angular

La estructura recomendada es:

```text
src/app/

├── core/
│   ├── auth/
│   ├── guards/
│   ├── interceptors/
│   └── services/
│
├── shared/
│   ├── components/
│   ├── interfaces/
│   └── utils/
│
├── features/
│   ├── auth/
│   ├── facilities/
│   ├── reservations/
│   └── admin/
│
└── app.routes.ts
```

---

# 5. Separación de responsabilidades

Los componentes Angular no deben realizar consultas directamente a Supabase.

Evitar:

```typescript
@Component(...)
export class ReservationsComponent {

  async loadReservations() {

    const { data } =
      await supabase
        .from('reservations')
        .select('*');

  }

}
```

Preferir:

```text
Component
    │
    ▼
ReservationService
    │
    ▼
SupabaseService
    │
    ▼
Supabase
```

Ejemplo:

```typescript
@Component(...)
export class ReservationsComponent {

  private reservationService =
    inject(ReservationService);

  loadReservations() {

    this.reservationService
      .getMyReservations();

  }

}
```

---

# 6. Tipos TypeScript

Se recomienda generar los tipos TypeScript desde Supabase.

Los tipos deben representar las tablas:

```text
profiles
facility_types
facilities
operating_hours
special_operating_hours
reservations
reservation_status_history
```

No se recomienda duplicar manualmente los tipos de base de datos si el proyecto utiliza generación automática.

---

# 7. Autenticación

El flujo esperado es:

```text
Usuario
    │
    ▼
Login / Register
    │
    ▼
Supabase Auth
    │
    ▼
auth.users
    │
    ▼
Trigger
    │
    ▼
profiles
```

Después de autenticarse, Angular debe obtener:

```text
Session
User
Profile
```

El perfil permite conocer:

```text
role
status
first_name
last_name
```

---

# 8. Guards

Se deben crear guards para proteger rutas.

Ejemplo conceptual:

```text
/auth/login
/auth/register

/customer
/customer/reservations

/admin
/admin/facilities
/admin/reservations
/admin/users
```

Un usuario no autenticado no debe acceder a:

```text
/customer
/admin
```

Un usuario `CUSTOMER` no debe acceder a:

```text
/admin
```

El guard mejora la experiencia del usuario.

Sin embargo, la seguridad real está en Supabase RLS.

---

# 9. Servicios

Se recomienda crear servicios separados:

```text
AuthService
ProfileService
FacilityService
ReservationService
OperatingHoursService
```

Cada servicio debe encargarse de una responsabilidad específica.

---

# 10. FacilityService

Responsabilidades:

* Listar instalaciones.
* Obtener instalación por ID.
* Consultar tipos.
* Filtrar instalaciones activas.

Ejemplos:

```typescript
getFacilities()
```

```typescript
getFacilityById(id)
```

```typescript
getFacilityTypes()
```

---

# 11. ReservationService

Responsabilidades:

* Obtener mis reservas.
* Consultar disponibilidad.
* Crear reservas.
* Cancelar reservas.

Métodos esperados:

```typescript
getMyReservations()
```

```typescript
getFacilityAvailability(
  facilityId,
  startAt,
  endAt
)
```

```typescript
createReservation(
  facilityId,
  startAt,
  endAt
)
```

```typescript
cancelMyReservation(
  reservationId
)
```

---

# 12. Crear una reserva

Angular debe utilizar RPC.

Conceptualmente:

```typescript
const { data, error } =
  await supabase.rpc(
    'create_reservation',
    {
      p_facility_id: facilityId,
      p_start_at: startAt,
      p_end_at: endAt,
    }
  );
```

No realizar:

```typescript
supabase
  .from('reservations')
  .insert(...)
```

para reservas de clientes.

---

# 13. Cancelar una reserva

Utilizar:

```typescript
supabase.rpc(
  'cancel_my_reservation',
  {
    p_reservation_id: reservationId
  }
);
```

El backend valida si la cancelación es válida.

Angular debe mostrar el error al usuario de manera amigable.

---

# 14. Errores

Los errores técnicos de Supabase no deben mostrarse directamente al usuario.

Ejemplo:

```text
RESERVATION_TIME_IS_NO_LONGER_AVAILABLE
```

Debe transformarse en:

```text
El horario seleccionado ya no está disponible.
Por favor, selecciona otro horario.
```

Se recomienda crear un mapper:

```text
SupabaseErrorMapper
```

Ejemplo:

```typescript
mapReservationError(error)
```

---

# 15. Disponibilidad

El flujo recomendado:

```text
Usuario selecciona instalación
        │
        ▼
Usuario selecciona fecha
        │
        ▼
Angular consulta horario
        │
        ▼
Angular consulta reservas
        │
        ▼
Angular genera slots
        │
        ▼
Usuario selecciona slot
        │
        ▼
Usuario confirma
        │
        ▼
RPC create_reservation()
        │
        ├── OK
        │
        └── Conflicto
```

La disponibilidad mostrada en Angular es una representación visual.

La validación definitiva ocurre siempre en PostgreSQL.

---

# 16. Manejo de fechas

Las fechas deben enviarse a Supabase como valores ISO compatibles con `TIMESTAMPTZ`.

Ejemplo:

```text
2026-07-28T22:00:00.000Z
```

La interfaz puede mostrar:

```text
28/07/2026 18:00
```

La conversión debe considerar:

```text
America/Santiago
```

No utilizar offsets fijos como:

```text
UTC-4
UTC-3
```

La aplicación debe utilizar una librería o API que soporte zonas horarias.

---

# 17. Reglas importantes

Nunca confiar exclusivamente en Angular para:

* Roles.
* Permisos.
* Disponibilidad.
* Conflictos de reservas.
* Estado del usuario.
* Estado de la instalación.

Angular proporciona UX.

Supabase proporciona seguridad e integridad.

---

# 18. Flujo completo

```text
Angular Component
        │
        ▼
Feature Service
        │
        ▼
Supabase Client
        │
        ▼
Supabase Auth / RPC / Query
        │
        ▼
RLS
        │
        ▼
PostgreSQL
```

Este patrón debe mantenerse durante el desarrollo de SportHub.
