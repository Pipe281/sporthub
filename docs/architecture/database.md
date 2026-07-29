# SportHub - Arquitectura de Base de Datos

## 1. Descripción

SportHub utiliza Supabase como backend principal de la aplicación.

Supabase proporciona:

* PostgreSQL como base de datos.
* Supabase Auth para autenticación.
* Row Level Security (RLS) para autorización a nivel de base de datos.
* RPC mediante funciones PostgreSQL para lógica de negocio.
* API REST generada automáticamente.
* Realtime, disponible para futuras funcionalidades.

La base de datos se encuentra definida en el script:

```text
supabase/schema.sql
```

---

# 2. Modelo de datos

La estructura principal es:

```text
auth.users
    │
    │ 1:1
    ▼
profiles
    │
    ├──────────────┐
    │              │
    ▼              ▼
reservations    user_role
    │
    │ N:1
    ▼
facilities
    │
    │ N:1
    ▼
facility_types
```

La gestión de horarios se realiza mediante:

```text
operating_hours
special_operating_hours
```

El historial de las reservas se registra en:

```text
reservation_status_history
```

---

# 3. Usuarios

## Tabla

```text
profiles
```

Cada usuario autenticado en Supabase Auth tiene un perfil asociado.

Campos principales:

| Campo      | Tipo        | Descripción         |
| ---------- | ----------- | ------------------- |
| id         | UUID        | ID de `auth.users`  |
| first_name | TEXT        | Nombre              |
| last_name  | TEXT        | Apellido            |
| phone      | TEXT        | Teléfono            |
| role       | ENUM        | CUSTOMER o ADMIN    |
| status     | ENUM        | ACTIVE o BLOCKED    |
| created_at | TIMESTAMPTZ | Fecha de creación   |
| updated_at | TIMESTAMPTZ | Última modificación |

---

# 4. Roles

SportHub actualmente tiene dos roles:

## CUSTOMER

Usuario normal de la plataforma.

Puede:

* Consultar instalaciones.
* Consultar disponibilidad.
* Crear reservas.
* Consultar sus propias reservas.
* Cancelar sus reservas según las reglas del sistema.

No puede:

* Crear instalaciones.
* Modificar instalaciones.
* Modificar horarios.
* Consultar reservas de otros clientes.
* Modificar su propio rol.
* Modificar su estado.

---

## ADMIN

Usuario administrador.

Puede:

* Gestionar instalaciones.
* Gestionar tipos de instalaciones.
* Gestionar horarios.
* Consultar todas las reservas.
* Gestionar usuarios.
* Cancelar reservas.
* Gestionar la operación del centro deportivo.

---

# 5. Instalaciones

## facility_types

Representa el tipo de instalación.

Ejemplos:

```text
PÁDEL
FÚTBOL
TENIS
SALA
```

---

## facilities

Representa una instalación concreta.

Ejemplo:

```text
Tipo: PÁDEL
Nombre: Cancha de Pádel 1
Capacidad: 4
Precio por hora: 20000
Estado: ACTIVE
```

Una instalación puede tener los siguientes estados:

```text
ACTIVE
INACTIVE
MAINTENANCE
```

Solo las instalaciones `ACTIVE` pueden ser reservadas.

---

# 6. Horarios

El horario normal se almacena en:

```text
operating_hours
```

La semana utiliza:

```text
0 = Domingo
1 = Lunes
2 = Martes
3 = Miércoles
4 = Jueves
5 = Viernes
6 = Sábado
```

Ejemplo:

```text
Lunes
09:00 - 23:00
```

Los días especiales se gestionan mediante:

```text
special_operating_hours
```

Esto permite definir:

* Feriados.
* Días cerrados.
* Horarios especiales.
* Eventos.

Una configuración especial tiene prioridad sobre el horario semanal.

---

# 7. Reservas

Las reservas se almacenan en:

```text
reservations
```

Una reserva contiene:

```text
customer_id
facility_id
start_at
end_at
status
```

Los estados disponibles son:

```text
PENDING
CONFIRMED
CANCELLED
COMPLETED
```

Para el MVP, las reservas creadas por clientes se generan directamente como:

```text
CONFIRMED
```

---

# 8. Reglas de reservas

Una reserva debe cumplir:

* El usuario debe estar autenticado.
* El usuario debe ser `CUSTOMER`.
* El usuario debe estar `ACTIVE`.
* La instalación debe existir.
* La instalación debe estar `ACTIVE`.
* La fecha debe ser futura.
* La duración mínima es de 1 hora.
* La duración máxima es de 2 horas.
* El inicio debe corresponder a un slot de 30 minutos.
* El término debe corresponder a un slot de 30 minutos.
* La reserva debe estar dentro del horario de funcionamiento.
* No puede existir otra reserva activa que se superponga.

Las reservas activas son:

```text
PENDING
CONFIRMED
```

Las reservas:

```text
CANCELLED
COMPLETED
```

no bloquean disponibilidad.

---

# 9. Conflictos de reservas

La base de datos tiene una restricción PostgreSQL que impide reservas superpuestas.

Por ejemplo:

```text
Cancha 1

18:00 ├──────────┤ 19:00
              Reserva A

18:30       ├──────────┤ 19:30
            Reserva B
```

La segunda reserva será rechazada.

Esta validación existe a nivel de PostgreSQL para proteger la integridad de los datos incluso si dos usuarios intentan reservar simultáneamente.

---

# 10. RLS

Todas las tablas principales utilizan Row Level Security.

Los clientes solo pueden consultar sus propias reservas:

```text
customer_id = auth.uid()
```

Los administradores pueden consultar y gestionar información global.

La autorización no debe depender exclusivamente del frontend Angular.

El frontend puede ocultar botones y funcionalidades, pero la seguridad real está implementada en Supabase mediante:

* RLS.
* Funciones PostgreSQL.
* Validaciones de negocio.

---

# 11. Creación de reservas

La aplicación Angular no debe crear reservas mediante un `INSERT` directo.

Debe utilizar la función RPC:

```text
create_reservation()
```

La función se encarga de:

1. Verificar autenticación.
2. Verificar usuario activo.
3. Validar duración.
4. Validar slots.
5. Validar instalación.
6. Validar estado de instalación.
7. Validar horario.
8. Crear la reserva.
9. Registrar historial.
10. Detectar conflictos de concurrencia.

---

# 12. Cancelación de reservas

Los clientes deben utilizar:

```text
cancel_my_reservation()
```

Los administradores deben utilizar:

```text
cancel_reservation_as_admin()
```

Los clientes pueden cancelar una reserva hasta 2 horas antes del inicio.

Ejemplo:

```text
Reserva:
18:00

Último momento para cancelar:
16:00
```

Después de las 16:00, la operación debe ser rechazada.

---

# 13. Disponibilidad

Angular puede consultar las reservas existentes mediante:

```text
get_facility_availability()
```

Esta función devuelve las reservas activas que interfieren con un rango de tiempo.

La aplicación Angular es responsable de transformar esta información en una interfaz visual de disponibilidad.

Ejemplo:

```text
09:00  Disponible
09:30  Disponible
10:00  Reservado
10:30  Reservado
11:00  Disponible
11:30  Disponible
```

---

# 14. Zona horaria

SportHub utiliza:

```text
America/Santiago
```

Las fechas deben manejarse como `TIMESTAMPTZ`.

La aplicación debe evitar manipular fechas mediante strings manuales.

La conversión entre:

```text
UTC
```

y:

```text
America/Santiago
```

debe realizarse utilizando APIs de fecha/hora apropiadas.

No se debe asumir que la diferencia horaria es siempre fija, ya que Chile puede modificar sus reglas de horario de verano/invierno.

---

# 15. Principio arquitectónico

La arquitectura sigue esta separación:

```text
Angular
│
│ UI
│ State
│ Forms
│ User interaction
│
▼
Supabase Client
│
▼
Supabase Auth
│
▼
RLS
│
▼
RPC / PostgreSQL
│
▼
Database
```

Angular debe encargarse principalmente de:

* Presentación.
* Interacción.
* Validaciones de UX.
* Formularios.
* Estado de la interfaz.

Supabase/PostgreSQL debe encargarse de:

* Seguridad.
* Autorización.
* Integridad.
* Reglas críticas.
* Concurrencia.
* Persistencia.
* Lógica crítica de reservas.
