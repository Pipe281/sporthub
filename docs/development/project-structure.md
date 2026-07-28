# Estructura del proyecto

## Introducción

SportHub utiliza una arquitectura basada en funcionalidades (_Feature-Based Architecture_) utilizando Angular Standalone Components.

El objetivo de esta estructura es mantener una separación clara de responsabilidades, facilitar el mantenimiento del código y permitir que nuevas funcionalidades puedan incorporarse sin afectar el resto de la aplicación.

La estructura principal del proyecto es la siguiente:

```text
src/
└── app/
    ├── core/
    ├── shared/
    ├── layouts/
    └── features/
```

---

# Core

El directorio **core** contiene la infraestructura global de la aplicación.

Aquí se ubican los elementos que son utilizados por múltiples funcionalidades y que normalmente existen una única vez durante la ejecución de la aplicación.

Ejemplos:

- Servicios de autenticación.
- Guards.
- Interceptors.
- Configuración global.
- Constantes.
- Servicios compartidos por toda la aplicación.

Los elementos del directorio **core** no pertenecen a una funcionalidad específica del negocio.

---

# Shared

El directorio **shared** contiene componentes y recursos reutilizables que no pertenecen a un dominio específico del sistema.

Su objetivo es evitar la duplicación de código y proporcionar elementos comunes para toda la aplicación.

Ejemplos:

- Botones.
- Modales.
- Spinner de carga.
- Componentes de interfaz reutilizables.
- Pipes.
- Directivas.
- Utilidades compartidas.

Los elementos de **shared** deben ser genéricos y reutilizables.

---

# Layouts

El directorio **layouts** contiene las estructuras visuales utilizadas por diferentes áreas de la aplicación.

Un layout define la distribución general de una página, permitiendo reutilizar elementos como barras de navegación, sidebars o footers.

Ejemplos:

- Layout público.
- Layout de cliente.
- Layout administrativo.

Cada layout actúa como un contenedor donde posteriormente se cargan las páginas correspondientes mediante el Router de Angular.

---

# Features

El directorio **features** contiene las funcionalidades de negocio de SportHub.

Cada funcionalidad es independiente y agrupa todos los elementos necesarios para su funcionamiento.

Ejemplos de funcionalidades:

- Auth
- Dashboard
- Facilities
- Customers
- Reservations
- Calendar

Cada feature es responsable únicamente de su propio dominio de negocio.

---

# Organización interna de una feature

Cada funcionalidad mantiene su propio código organizado internamente.

Un ejemplo de estructura es:

```text
features/
└── reservations/
    ├── components/
    ├── pages/
    ├── services/
    ├── models/
    ├── reservations.routes.ts
    └── ...
```

Esta organización permite mantener el código desacoplado y facilita el crecimiento del proyecto.

---

# Componentes

Los componentes deben ubicarse según su responsabilidad.

- Los componentes reutilizables y genéricos deben ubicarse en **shared**.
- Los componentes específicos de una funcionalidad deben ubicarse dentro de la carpeta **components** de su respectiva feature.

Ejemplos:

- `ButtonComponent` → `shared/components`
- `FacilityCardComponent` → `features/facilities/components`
- `ReservationCardComponent` → `features/reservations/components`

---

# Servicios

Los servicios también se organizan según su responsabilidad.

Los servicios globales de la aplicación pertenecen al directorio **core**.

Los servicios que contienen lógica de negocio específica pertenecen a la feature correspondiente.

Ejemplos:

- `AuthService` → `core`
- `FacilitiesService` → `features/facilities/services`
- `ReservationsService` → `features/reservations/services`

---

# Modelos

Los modelos representan las entidades utilizadas por cada funcionalidad.

Siempre que un modelo pertenezca a un dominio específico, debe ubicarse dentro de la carpeta **models** de la feature correspondiente.

Ejemplos:

- `Facility`
- `Reservation`
- `Customer`

Mantener los modelos cerca de la funcionalidad que los utiliza mejora la organización y facilita el mantenimiento del código.

---

# Convenciones generales

Durante el desarrollo de SportHub se siguen las siguientes convenciones:

- Separar claramente la lógica de negocio de la lógica de presentación.
- Mantener cada feature independiente del resto de la aplicación.
- Evitar la duplicación de código.
- Favorecer la reutilización mediante componentes compartidos.
- Utilizar nombres consistentes para carpetas, archivos y componentes.
- Mantener una arquitectura escalable y fácil de mantener.
