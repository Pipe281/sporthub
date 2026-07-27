# SportHub

SportHub es una plataforma web para la gestión y reserva de instalaciones deportivas.

La plataforma permite a los clientes explorar las instalaciones deportivas disponibles, consultar su disponibilidad y realizar reservas. Los administradores pueden gestionar las instalaciones, clientes y reservas a través de un área administrativa.

El proyecto se desarrolla como una simulación de un proyecto de software real, siguiendo prácticas profesionales de desarrollo como flujos de trabajo con Git, gestión de tareas, revisión de código, Pull Requests, pruebas y despliegue continuo.

---

## Descripción general

SportHub está diseñado para un centro deportivo que ofrece diferentes tipos de instalaciones, como:

* Canchas de pádel
* Canchas de fútbol
* Canchas de tenis
* Salas multiuso

Los clientes pueden utilizar la plataforma para consultar las instalaciones disponibles y gestionar sus reservas.

Los administradores pueden gestionar las operaciones del centro deportivo mediante un panel administrativo.

---

## Funcionalidades principales

### Cliente

Los clientes podrán:

* Crear una cuenta
* Iniciar y cerrar sesión
* Consultar las instalaciones deportivas disponibles
* Ver el detalle de una instalación
* Consultar la disponibilidad de las instalaciones
* Crear reservas
* Consultar sus reservas
* Cancelar reservas que cumplan con las condiciones establecidas

### Administrador

Los administradores podrán:

* Acceder al dashboard administrativo
* Consultar métricas del negocio
* Gestionar instalaciones deportivas
* Gestionar clientes
* Gestionar reservas
* Consultar reservas mediante un calendario
* Filtrar y buscar información de reservas
* Cancelar reservas cuando sea necesario

---

## Stack tecnológico

### Frontend

* Angular
* TypeScript
* RxJS
* Angular Signals
* Reactive Forms

### Backend e infraestructura

* Supabase
* PostgreSQL
* Supabase Authentication
* Row Level Security (RLS)
* Supabase Storage

### Herramientas de desarrollo

* Git
* GitHub
* Jira
* Figma
* Visual Studio Code

---

## Arquitectura

El frontend utiliza una arquitectura basada en funcionalidades (*feature-based architecture*) utilizando Angular Standalone Components.

La aplicación se organiza en torno a los principales dominios de negocio de la plataforma.

Las principales áreas de la arquitectura incluyen:

* Core
* Shared
* Layouts
* Features

Cada funcionalidad de negocio es responsable de sus propias páginas, componentes, servicios y modelos cuando corresponda.

La aplicación busca mantener la lógica de negocio separada de la lógica de presentación y fomentar el desarrollo de componentes reutilizables y mantenibles.

La documentación detallada de la arquitectura estará disponible en el directorio `/docs`.

---

## Estructura del proyecto

El proyecto sigue una estructura similar a:

```text
src/
└── app/
    ├── core/
    ├── shared/
    ├── layouts/
    └── features/
        ├── auth/
        ├── dashboard/
        ├── facilities/
        ├── customers/
        ├── reservations/
        └── calendar/
```

La estructura exacta puede evolucionar a medida que el proyecto crezca.

---

## Roles de usuario

Actualmente, SportHub define dos roles principales:

### Cliente

Un cliente puede gestionar sus propias reservas e interactuar con las instalaciones deportivas disponibles.

### Administrador

Un administrador puede gestionar la plataforma y acceder a funcionalidades administrativas que no están disponibles para los clientes.

El acceso a recursos protegidos se controla mediante mecanismos de autenticación y autorización.

---

## Flujo de desarrollo

Todo trabajo de desarrollo debe estar asociado a una tarea de Jira.

Antes de comenzar una tarea:

1. Revisar la tarea en Jira.
2. Comprender los criterios de aceptación.
3. Verificar que la tarea esté lista para ser desarrollada.
4. Crear una rama desde la rama base correspondiente.

Convenciones para nombres de ramas:

```text
feature/SPH-123-descripcion-corta
bugfix/SPH-456-descripcion-corta
chore/SPH-789-descripcion-corta
```

Ejemplo:

```text
feature/SPH-101-crear-listado-instalaciones
```

Una vez finalizado el desarrollo:

1. Realizar los commits correspondientes.
2. Subir la rama a GitHub.
3. Crear un Pull Request.
4. Referenciar la tarea de Jira correspondiente.
5. Solicitar una revisión de código.
6. Resolver los comentarios de la revisión.
7. Esperar la aprobación.
8. Realizar el merge del Pull Request.

---

## Estrategia de ramas

El proyecto utiliza las siguientes ramas principales:

### `main`

Contiene el código listo para producción.

Los cambios solo deben llegar a `main` mediante el flujo establecido de Pull Requests.

### `develop`

Contiene la última versión integrada del desarrollo.

Las ramas de funcionalidades normalmente deben crearse a partir de `develop`.

### Ramas de funcionalidades

Se utilizan para desarrollar nuevas funcionalidades.

```text
feature/SPH-123-descripcion
```

### Ramas de corrección de errores

Se utilizan para corregir problemas existentes.

```text
bugfix/SPH-456-descripcion
```

---

## Pull Requests

Todo Pull Request debe:

* Referenciar la tarea de Jira relacionada.
* Tener un título claro.
* Incluir una descripción concisa de los cambios.
* Explicar las decisiones técnicas relevantes cuando corresponda.
* Incluir capturas de pantalla cuando existan cambios en la interfaz.
* Superar las validaciones automatizadas requeridas.
* Ser revisado antes de realizar el merge.

Un Pull Request puede requerir cambios antes de ser aprobado.

La revisión de código es considerada parte del proceso de desarrollo y no un paso opcional.

---

## Calidad del código

El proyecto busca mantener:

* Código limpio y fácil de leer.
* Tipado fuerte utilizando TypeScript.
* Componentes reutilizables.
* Separación clara de responsabilidades.
* Convenciones de nombres consistentes.
* Mínima duplicación de código.
* Manejo adecuado de errores.
* Interfaces accesibles.
* Diseños responsivos.
* Una arquitectura mantenible.

Las decisiones técnicas deben priorizar la simplicidad, mantenibilidad y consistencia con el código existente.

---

## Configuración del entorno

### Requisitos

Antes de comenzar el desarrollo, es necesario tener instaladas las siguientes herramientas:

* Node.js
* npm
* Angular CLI
* Git

La versión recomendada de Node.js está definida en el archivo `.nvmrc`.

---

## Instalación

Clonar el repositorio:

```bash
git clone <repository-url>
```

Ingresar al directorio del proyecto:

```bash
cd sporthub
```

Instalar las dependencias:

```bash
npm install
```

---

## Variables de entorno

Crear la configuración de entorno local de acuerdo con las directrices de configuración del proyecto.

Se requerirá la configuración de Supabase para conectar la aplicación con el backend de desarrollo.

Las variables de entorno y secretos nunca deben ser incluidos en el repositorio.

No se deben subir al repositorio:

* API Keys
* Access Tokens
* Contraseñas
* Service Role Keys
* Credenciales privadas

---

## Ejecutar la aplicación

Iniciar el servidor de desarrollo:

```bash
npm start
```

La aplicación estará disponible en:

```text
http://localhost:4200
```

---

## Base de datos

SportHub utiliza PostgreSQL a través de Supabase.

La base de datos almacena los principales datos del negocio de la aplicación, incluyendo:

* Perfiles de usuarios
* Clientes
* Tipos de instalaciones
* Instalaciones deportivas
* Reservas

Los cambios en la base de datos deben gestionarse mediante el flujo de migraciones establecido en el proyecto.

Las políticas de Row Level Security (RLS) se utilizan para controlar el acceso a los datos protegidos.

---

## Autenticación

La autenticación de usuarios se gestiona mediante Supabase Authentication.

La aplicación permite el acceso autenticado tanto para clientes como para administradores.

Las áreas protegidas de la aplicación requieren autenticación.

Las reglas de autorización determinan qué funcionalidades y recursos están disponibles para cada rol de usuario.

---

## Pruebas

Las pruebas automatizadas forman parte del proceso de desarrollo del proyecto.

El proyecto puede incluir:

* Pruebas unitarias
* Pruebas de integración
* Pruebas end-to-end

Las nuevas funcionalidades deben incluir las pruebas correspondientes cuando sean requeridas por los criterios de aceptación o las directrices de desarrollo.

---

## Despliegue

La aplicación será desplegada mediante un flujo de entrega continua.

El flujo esperado es:

```text
Desarrollador
      │
      ▼
Rama de funcionalidad
      │
      ▼
Pull Request
      │
      ▼
Revisión de código
      │
      ▼
Validaciones automatizadas
      │
      ▼
Merge
      │
      ▼
Despliegue
```

El entorno de producción solo debe contener código revisado y aprobado.

---

## Documentación

La documentación adicional del proyecto se mantendrá en el directorio `/docs`.

La documentación puede incluir:

```text
docs/
├── product/
├── architecture/
└── development/
```

La documentación evolucionará junto con el proyecto.

---

## Gestión del proyecto

La gestión del proyecto se realiza utilizando Jira.

Cada tarea de Jira debe proporcionar la información necesaria para que un desarrollador pueda comprender:

* Qué se debe desarrollar.
* Por qué es necesario.
* Cuáles son los criterios de aceptación.
* Referencias de diseño relevantes.
* Dependencias o consideraciones técnicas.

El backlog de Jira es la fuente principal de información para el trabajo de desarrollo planificado.

---

## Diseño

Los diseños de interfaz y las especificaciones del producto se mantienen en Figma cuando corresponda.

Las referencias de diseño deben estar incluidas en las tareas de Jira correspondientes.

Los desarrolladores deben revisar el diseño antes de implementar tareas relacionadas con la interfaz de usuario.

---

## Solicitud de ayuda

Si encuentras un problema técnico que te impide avanzar:

1. Lee la documentación relacionada.
2. Revisa el código existente.
3. Consulta la documentación oficial de las tecnologías involucradas.
4. Intenta reproducir y aislar el problema.
5. Documenta lo que ya has intentado.
6. Solicita ayuda proporcionando el contexto relevante.

Al solicitar ayuda, incluye:

* Qué estás intentando conseguir.
* Qué esperabas que ocurriera.
* Qué ocurrió realmente.
* Los mensajes de error relevantes.
* Qué has investigado o intentado hasta el momento.

---

## Estado del proyecto

SportHub se encuentra actualmente en desarrollo.

El proyecto se desarrolla de forma incremental mediante iteraciones y sprints planificados.

Las funcionalidades, la arquitectura y las decisiones técnicas pueden evolucionar a medida que se incorporen nuevos requerimientos.

---

## Licencia

Este proyecto es privado y está destinado a fines educativos y de desarrollo.
