# SportHub — Descripción funcional del producto

## 1. Propósito del documento

Este documento describe la definición funcional de SportHub, una plataforma web para la gestión y reserva de instalaciones deportivas.

Su objetivo es establecer una visión común del producto, sus usuarios, funcionalidades y reglas de negocio.

Este documento sirve como referencia para:

* Definir el alcance del producto.
* Identificar las funcionalidades principales.
* Establecer las reglas de negocio.
* Guiar el desarrollo de nuevas funcionalidades.
* Crear y organizar el backlog del proyecto.
* Definir las historias de usuario.
* Validar que las funcionalidades implementadas cumplan con los requerimientos esperados.

La implementación técnica del producto se documenta por separado en la documentación de arquitectura y desarrollo.

---

# 2. Descripción del producto

SportHub es una plataforma web destinada a la gestión de un centro deportivo y sus instalaciones.

La plataforma permite a los clientes consultar las instalaciones deportivas disponibles, revisar su disponibilidad y realizar reservas.

Los administradores pueden gestionar las instalaciones, clientes y reservas mediante un área administrativa.

El sistema busca centralizar la gestión de reservas y reducir la dependencia de procesos manuales como:

* Reservas por teléfono.
* Reservas por WhatsApp.
* Mensajes en redes sociales.
* Uso de planillas Excel.
* Agendas físicas.

SportHub será desarrollado inicialmente para un único centro deportivo.

La primera versión del producto no contempla la gestión de múltiples centros deportivos independientes.

---

# 3. Objetivos del producto

Los principales objetivos de SportHub son:

1. Centralizar la gestión de las instalaciones deportivas.
2. Permitir a los clientes consultar la disponibilidad de las instalaciones.
3. Permitir la creación y gestión de reservas.
4. Evitar conflictos y reservas duplicadas.
5. Facilitar a los administradores la gestión de las operaciones del centro deportivo.
6. Proporcionar una visión centralizada de las reservas.
7. Reducir la carga de trabajo asociada a la gestión manual de reservas.

---

# 4. Alcance inicial

La primera versión de SportHub incluirá:

* Autenticación de usuarios.
* Gestión de perfiles.
* Gestión de roles.
* Gestión de instalaciones deportivas.
* Consulta de disponibilidad.
* Creación de reservas.
* Consulta de reservas.
* Cancelación de reservas.
* Gestión de clientes.
* Gestión administrativa de reservas.
* Calendario de reservas.
* Dashboard administrativo.

---

# 5. Fuera del alcance inicial

Las siguientes funcionalidades no forman parte del MVP inicial:

* Pagos en línea.
* Integración con Webpay.
* Integración con Mercado Pago.
* Facturación electrónica.
* Gestión de múltiples centros deportivos.
* Aplicación móvil nativa.
* Notificaciones push.
* Integración con WhatsApp.
* Envío automático de correos electrónicos.
* Sistema de membresías.
* Sistema de cupones.
* Sistema de promociones.
* Gestión de torneos.
* Marketplace de centros deportivos.
* Programa de puntos o fidelización.

Estas funcionalidades podrían incorporarse posteriormente como nuevos requerimientos del producto.

---

# 6. Usuarios del sistema

SportHub contará inicialmente con dos roles principales:

* Cliente.
* Administrador.

Los permisos y funcionalidades disponibles dependerán del rol asignado a cada usuario.

---

# 7. Cliente

El cliente es una persona que utiliza las instalaciones deportivas del centro.

## 7.1 Funcionalidades

El cliente podrá:

* Registrarse.
* Iniciar sesión.
* Cerrar sesión.
* Consultar instalaciones deportivas.
* Consultar información de una instalación.
* Consultar disponibilidad.
* Crear reservas.
* Consultar sus reservas.
* Consultar el detalle de sus reservas.
* Cancelar reservas cuando cumplan las condiciones establecidas.

---

# 8. Administrador

El administrador es responsable de gestionar las operaciones del centro deportivo.

## 8.1 Funcionalidades

El administrador podrá:

* Iniciar sesión.
* Consultar el dashboard.
* Consultar métricas básicas.
* Gestionar instalaciones.
* Gestionar clientes.
* Consultar reservas.
* Consultar reservas mediante un calendario.
* Filtrar reservas.
* Buscar reservas.
* Consultar el detalle de una reserva.
* Cancelar reservas.
* Gestionar manualmente determinadas operaciones administrativas.

Las funcionalidades administrativas podrán ampliarse en futuras versiones.

---

# 9. Instalaciones deportivas

Una instalación representa un espacio físico disponible para ser utilizado por los clientes.

Ejemplos:

* Cancha de Pádel #1.
* Cancha de Pádel #2.
* Cancha de Fútbol #1.
* Cancha de Tenis #1.
* Sala Multiuso #1.

## 9.1 Información de una instalación

Una instalación tendrá, como mínimo, la siguiente información:

* Nombre.
* Descripción.
* Tipo de instalación.
* Capacidad.
* Precio por hora.
* Estado.
* Imagen.
* Fecha de creación.

---

# 10. Tipos de instalaciones

Inicialmente, SportHub contempla los siguientes tipos:

* Pádel.
* Fútbol.
* Tenis.
* Sala multiuso.

Los tipos de instalaciones se gestionarán como entidades independientes para permitir una futura ampliación del sistema.

---

# 11. Estado de las instalaciones

Cada instalación tendrá uno de los siguientes estados:

* Activa.
* Inactiva.
* En mantenimiento.

## 11.1 Activa

Una instalación activa está disponible para ser reservada, siempre que exista disponibilidad para el horario solicitado.

## 11.2 Inactiva

Una instalación inactiva no puede ser reservada.

Las reservas existentes deberán conservar su información histórica.

## 11.3 En mantenimiento

Una instalación en mantenimiento no puede recibir nuevas reservas durante el período en que se encuentre en este estado.

El comportamiento respecto de reservas existentes deberá definirse según el caso y podrá implicar una cancelación administrativa.

---

# 12. Reservas

Una reserva representa la utilización de una instalación deportiva durante un período de tiempo determinado.

Una reserva estará asociada como mínimo a:

* Un cliente.
* Una instalación.
* Una fecha y hora de inicio.
* Una fecha y hora de término.
* Un estado.

Ejemplo:

```text
Cliente:
Juan Pérez

Instalación:
Cancha de Pádel #1

Inicio:
15/08/2026 18:00

Término:
15/08/2026 19:00

Estado:
Confirmada
```

---

# 13. Estados de una reserva

Una reserva podrá tener los siguientes estados:

* Pendiente.
* Confirmada.
* Cancelada.
* Completada.

## 13.1 Pendiente

La reserva ha sido creada, pero todavía no ha sido confirmada.

Este estado queda definido para permitir futuras funcionalidades relacionadas con pagos o confirmaciones.

El flujo inicial del MVP podrá crear reservas directamente como confirmadas.

## 13.2 Confirmada

La reserva ha sido creada correctamente y ocupa el horario correspondiente.

## 13.3 Cancelada

La reserva fue cancelada por el cliente o por un administrador.

Una reserva cancelada no ocupa disponibilidad futura.

La información histórica de la reserva debe conservarse.

## 13.4 Completada

La fecha y hora correspondiente a la reserva ya ha finalizado.

Una reserva completada no puede ser cancelada.

---

# 14. Creación de una reserva

El flujo principal para crear una reserva será:

```text
Cliente inicia sesión
        ↓
Consulta instalaciones
        ↓
Selecciona una instalación
        ↓
Selecciona una fecha
        ↓
Consulta disponibilidad
        ↓
Selecciona un horario disponible
        ↓
Confirma la reserva
        ↓
El sistema valida las reglas de negocio
        ↓
La reserva es creada
        ↓
La reserva queda confirmada
```

La disponibilidad mostrada al cliente debe reflejar las reservas existentes y las condiciones de funcionamiento de la instalación.

---

# 15. Regla de conflictos de horario

Una instalación no puede tener dos reservas confirmadas que se superpongan en el tiempo.

Ejemplo:

```text
Cancha de Pádel #1

18:00 ───────── 19:00
        Juan
```

Una segunda reserva:

```text
18:30 ───────── 19:30
        Pedro
```

No debe ser permitida.

La validación de conflictos debe realizarse de forma segura y no depender exclusivamente de la interfaz de usuario.

La disponibilidad mostrada en pantalla no garantiza por sí sola que una reserva pueda realizarse.

El sistema debe volver a validar la disponibilidad durante el proceso de creación de la reserva.

---

# 16. Duración de las reservas

Las reservas tendrán:

* Duración mínima: 1 hora.
* Duración máxima: 2 horas.

Los horarios disponibles estarán definidos en intervalos de 30 minutos.

Ejemplos válidos:

```text
09:00 → 10:00
09:30 → 10:30
10:00 → 12:00
```

Ejemplos no válidos:

```text
09:15 → 10:15
09:00 → 12:00
```

Las reglas de duración podrán variar en futuras versiones según el tipo de instalación.

---

# 17. Horario de funcionamiento

El centro deportivo tendrá un horario de funcionamiento.

Ejemplo:

```text
Lunes       09:00 - 23:00
Martes      09:00 - 23:00
Miércoles   09:00 - 23:00
Jueves      09:00 - 23:00
Viernes     09:00 - 00:00
Sábado      08:00 - 00:00
Domingo     09:00 - 22:00
```

Una reserva solo podrá realizarse dentro del horario de funcionamiento correspondiente.

El horario de funcionamiento podrá ser configurable en futuras versiones.

---

# 18. Reservas en fechas pasadas

No se pueden crear nuevas reservas para fechas u horarios que ya hayan pasado.

El sistema debe impedir la creación de una reserva cuyo inicio sea anterior a la fecha y hora actual.

---

# 19. Cancelación de reservas

Un cliente podrá cancelar una reserva siempre que cumpla las condiciones establecidas.

La regla inicial será:

> Una reserva puede ser cancelada por el cliente hasta 2 horas antes de su hora de inicio.

Ejemplo:

```text
Reserva:
18:00

Hora actual:
14:00

Resultado:
Puede cancelar
```

Ejemplo:

```text
Reserva:
18:00

Hora actual:
17:00

Resultado:
No puede cancelar
```

Los administradores podrán cancelar reservas independientemente de esta restricción.

---

# 20. Reglas de cancelación

Cuando una reserva sea cancelada:

* El estado debe cambiar a `CANCELLED`.
* La reserva debe conservarse en el historial.
* El horario debe volver a estar disponible.
* La reserva no debe eliminarse físicamente del sistema.

---

# 21. Clientes

Los clientes tendrán un perfil asociado a su cuenta.

La información mínima será:

* Nombre.
* Apellido.
* Correo electrónico.
* Teléfono.
* Fecha de registro.
* Estado.

---

# 22. Estado de los clientes

Un cliente podrá tener uno de los siguientes estados:

* Activo.
* Bloqueado.

## 22.1 Activo

Puede utilizar normalmente la plataforma y crear reservas.

## 22.2 Bloqueado

Un cliente bloqueado:

* Puede iniciar sesión.
* Puede consultar información permitida.
* No puede crear nuevas reservas.

El comportamiento exacto de las reservas existentes de un cliente bloqueado deberá definirse según el caso.

---

# 23. Dashboard administrativo

El dashboard administrativo proporcionará una visión general del estado del centro deportivo.

Inicialmente mostrará métricas como:

* Reservas del día.
* Reservas del mes.
* Cantidad de clientes.
* Cantidad de instalaciones activas.

También podrá mostrar:

* Últimas reservas.
* Reservas próximas.
* Distribución de reservas por instalación.

Las métricas disponibles podrán ampliarse en futuras versiones.

---

# 24. Calendario administrativo

El administrador podrá consultar las reservas mediante una vista de calendario.

La vista permitirá:

* Consultar reservas por fecha.
* Consultar reservas por instalación.
* Visualizar los horarios ocupados.
* Consultar el detalle de una reserva.

En futuras versiones podrá permitir:

* Crear reservas manualmente.
* Modificar reservas.
* Mover reservas.
* Aplicar filtros avanzados.

---

# 25. Disponibilidad

La disponibilidad de una instalación dependerá de:

* Estado de la instalación.
* Horario de funcionamiento.
* Reservas existentes.
* Fecha y hora actual.
* Reglas de duración de las reservas.
* Posibles bloqueos o mantenimientos.

Una instalación no estará disponible si:

* Está inactiva.
* Está en mantenimiento.
* Se encuentra fuera del horario de funcionamiento.
* Existe una reserva confirmada que ocupa el horario solicitado.

---

# 26. Seguridad y acceso

Los usuarios deben autenticarse para acceder a las funcionalidades que requieren una cuenta.

Las funcionalidades administrativas deben estar restringidas a usuarios con rol de administrador.

Los clientes no deben poder acceder ni modificar información perteneciente a otros clientes.

El sistema debe aplicar controles de acceso tanto en la interfaz como en el backend.

La seguridad no debe depender únicamente de validaciones realizadas en el frontend.

---

# 27. Historial de información

SportHub debe conservar información histórica relevante.

Las reservas canceladas o completadas no deben eliminarse físicamente del sistema como parte del flujo normal de operación.

La eliminación física de información debe considerarse una operación administrativa especial y no una acción habitual.

---

# 28. Reglas de negocio principales

Las reglas principales del sistema son:

1. Un usuario debe estar autenticado para crear una reserva.
2. Un cliente no puede crear reservas si está bloqueado.
3. Una instalación inactiva no puede recibir nuevas reservas.
4. Una instalación en mantenimiento no puede recibir nuevas reservas.
5. No se pueden crear reservas en fechas pasadas.
6. Las reservas deben respetar el horario de funcionamiento.
7. La duración mínima de una reserva es de 1 hora.
8. La duración máxima de una reserva es de 2 horas.
9. Los horarios deben comenzar en intervalos de 30 minutos.
10. No pueden existir reservas confirmadas superpuestas para una misma instalación.
11. La disponibilidad debe validarse nuevamente al crear la reserva.
12. Un cliente puede cancelar una reserva hasta 2 horas antes de su inicio.
13. Un administrador puede cancelar una reserva independientemente de la anticipación.
14. Las reservas canceladas deben conservarse como historial.
15. Una reserva completada no puede ser cancelada.
16. Los clientes solo pueden gestionar sus propias reservas.
17. Los administradores pueden gestionar las reservas del centro deportivo.

---

# 29. MVP

La primera versión funcional de SportHub incluirá:

## Autenticación

* Registro de clientes.
* Inicio de sesión.
* Cierre de sesión.
* Gestión de sesión.
* Protección de rutas.
* Control de roles.

## Instalaciones

* Listado de instalaciones.
* Visualización del detalle.
* Gestión administrativa.
* Estados de instalación.
* Tipos de instalación.

## Reservas

* Consulta de disponibilidad.
* Creación de reservas.
* Consulta de reservas propias.
* Cancelación de reservas.
* Validación de conflictos.

## Clientes

* Gestión administrativa.
* Consulta de información.
* Activación y bloqueo de clientes.

## Administración

* Dashboard.
* Gestión de instalaciones.
* Gestión de clientes.
* Gestión de reservas.
* Calendario.

---

# 30. Evolución futura

SportHub podrá evolucionar posteriormente para incorporar funcionalidades como:

* Pagos en línea.
* Confirmación automática de reservas.
* Notificaciones por correo electrónico.
* Notificaciones mediante WhatsApp.
* Integración con proveedores de pago.
* Membresías.
* Promociones.
* Cupones.
* Descuentos.
* Gestión de torneos.
* Aplicación móvil.
* Multiempresa.
* Marketplace de centros deportivos.
* Reportes avanzados.
* Auditoría de operaciones.
* Sistema de fidelización.

Estas funcionalidades no forman parte del MVP y deberán ser evaluadas y planificadas como nuevos requerimientos.

---

# 31. Criterio general de evolución

La plataforma se desarrollará de forma incremental.

Las nuevas funcionalidades deberán:

1. Tener un requerimiento definido.
2. Ser incorporadas al backlog.
3. Ser analizadas y priorizadas.
4. Ser divididas en historias de usuario cuando corresponda.
5. Tener criterios de aceptación.
6. Ser desarrolladas mediante el flujo establecido.
7. Ser revisadas mediante Pull Request.
8. Ser validadas antes de considerarse completadas.

La documentación funcional deberá mantenerse actualizada cuando una nueva funcionalidad modifique las reglas existentes del producto.
