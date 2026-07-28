# SportHub - Módulo de Reservas

## Objetivo

Permitir que un cliente pueda consultar la disponibilidad de una instalación deportiva y realizar una reserva.

---

# Flujo de usuario

```text
Instalaciones
      │
      ▼
Seleccionar instalación
      │
      ▼
Seleccionar fecha
      │
      ▼
Consultar disponibilidad
      │
      ▼
Seleccionar horario
      │
      ▼
Confirmar reserva
      │
      ▼
Reserva creada
      │
      ▼
Mis reservas
```

---

# Reglas de negocio

Una reserva:

* Pertenece a un usuario.
* Pertenece a una instalación.
* Tiene fecha y hora de inicio.
* Tiene fecha y hora de término.
* Tiene un estado.

---

# Duración

Mínimo:

```text
1 hora
```

Máximo:

```text
2 horas
```

---

# Slots

Los horarios comienzan cada 30 minutos.

Ejemplo:

```text
09:00
09:30
10:00
10:30
11:00
```

No se permiten:

```text
09:15
09:45
10:15
```

---

# Disponibilidad

Una instalación no está disponible si existe una reserva:

```text
PENDING
```

o:

```text
CONFIRMED
```

que se superponga con el horario solicitado.

---

# Cancelación

Un cliente puede cancelar una reserva confirmada hasta 2 horas antes del inicio.

Ejemplo:

```text
Reserva:
18:00

Puede cancelar hasta:
16:00
```

---

# Creación

La reserva debe crearse mediante:

```text
create_reservation()
```

No se debe insertar directamente desde Angular.

---

# Cancelación

Cliente:

```text
cancel_my_reservation()
```

Administrador:

```text
cancel_reservation_as_admin()
```

---

# Estados

```text
PENDING
CONFIRMED
CANCELLED
COMPLETED
```

Para el MVP:

```text
create_reservation()
        │
        ▼
CONFIRMED
```

---

# Historial

Cada cambio de estado debe registrarse en:

```text
reservation_status_history
```

Ejemplo:

```text
NULL
  ↓
CONFIRMED
```

Luego:

```text
CONFIRMED
  ↓
CANCELLED
```

---

# Consideraciones de UX

Cuando el usuario intenta reservar un horario que acaba de ser tomado por otra persona:

```text
El horario seleccionado ya no está disponible.
Por favor, selecciona otro horario.
```

Esto puede ocurrir aunque Angular mostrara el horario como disponible previamente.

La disponibilidad es dinámica.

Por esta razón, siempre se debe manejar correctamente el error retornado por `create_reservation()`.
