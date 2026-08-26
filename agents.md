# SportHub - Guía para agentes de desarrollo

## Propósito

SportHub es una aplicación Angular para explorar instalaciones deportivas, consultar disponibilidad y gestionar reservas. Los administradores gestionan instalaciones, tipos de instalación y clientes.

Antes de modificar código, revisa la tarea asociada, los criterios de aceptación y la documentación relevante en `docs/`. Mantén los cambios acotados al objetivo solicitado.

## Stack y comandos

- Angular 20 con componentes standalone.
- TypeScript 5.9 en modo estricto.
- RxJS y Angular Signals para estado reactivo.
- Reactive Forms para formularios.
- Angular Material/CDK, Tailwind CSS 4 y SCSS para UI.
- Supabase: Auth, PostgreSQL, RLS, RPC y Storage.
- Zona horaria de negocio: `America/Santiago`.

Comandos disponibles:

```bash
npm install                 # instalar dependencias
npm start                   # servidor de desarrollo en localhost:4200
npm run build               # build de producción
npm run watch               # build incremental de desarrollo
npm test                    # pruebas unitarias con Karma/Jasmine
npm run db:types            # regenerar database.types.ts desde Supabase enlazado
```

Después de cambios TypeScript/Angular ejecuta al menos `npm run build`; para cambios de lógica, agrega o actualiza pruebas y ejecuta `npm test` cuando sea posible.

## Estructura actual

```text
src/
├── app/
│   ├── core/
│   │   ├── constants/       # constantes globales, incluidas rutas
│   │   ├── guards/          # authGuard, guestGuard, adminGuard
│   │   ├── interfaces/      # contratos globales
│   │   ├── services/        # Auth, Supabase, perfiles, facilities, reservas, etc.
│   │   └── types/           # tipos de dominio y database.types.ts generado
│   ├── features/
│   │   ├── auth/            # login, registro y recuperación de contraseña
│   │   ├── customer/        # perfil y reservas del cliente
│   │   ├── facilities/      # consulta de instalaciones
│   │   ├── admin/           # dashboard y gestión administrativa
│   │   └── shared/          # páginas transversales, como not-found
│   └── shared/ui/           # componentes reutilizables y modales
├── environments/            # configuración por entorno
└── styles/                  # tema, reset, snackbar y estilos globales
docs/                         # producto, arquitectura y desarrollo
public/                       # imágenes y assets estáticos
supabase/                     # configuración local de Supabase, si aplica
```

La estructura real prevalece sobre ejemplos antiguos de la documentación. No crees carpetas `services`, `models` o rutas por feature sin comprobar primero el patrón existente.

## Convenciones de implementación

- Usa componentes standalone y declara explícitamente sus `imports`.
- Usa `inject()` y propiedades `private readonly` para dependencias, siguiendo el código existente.
- Usa `signal()` para estado local; expón señales como `readonly` y actualízalas con `.set()` o `.update()`.
- Prefiere `input()` y `output()` en componentes nuevos cuando corresponda al patrón existente.
- Usa `NonNullableFormBuilder`, `ReactiveFormsModule` y validadores para formularios.
- Mantén la lógica de acceso a datos en servicios; los componentes deben coordinar UI, estado y navegación.
- Usa nombres en inglés para clases, propiedades, archivos y APIs; los textos visibles al usuario están en español.
- Respeta Prettier: ancho de línea 100, comillas simples y plugin de Tailwind. Ejecuta el formateador si el cambio lo requiere.
- Conserva el estilo visual actual: Tailwind para composición de UI, SCSS para estilos específicos y tokens definidos en `src/styles/`.
- Corrige errores de forma amigable para el usuario y registra detalles técnicos solo en consola cuando sea útil.
- No hagas refactors amplios ni cambies APIs públicas sin necesidad para la tarea.

## Rutas y autorización

Las rutas se centralizan en `src/app/app.routes.ts` y las rutas reutilizables en `src/app/core/constants/app-routes.constants.ts`.

- Rutas públicas de autenticación usan `guestGuard`.
- Rutas autenticadas usan `authGuard`.
- Rutas administrativas usan `authGuard` y `adminGuard`.
- La protección de la interfaz no reemplaza RLS ni las validaciones de Supabase.

Al agregar una ruta, define el guard correcto y verifica navegación desde los flujos existentes.

## Supabase y datos

`SupabaseService` crea el único cliente compartido. Los servicios de dominio deben obtenerlo mediante inyección y comprobar siempre `{ data, error }`.

- No expongas `service_role` keys ni secretos en el frontend.
- No hardcodees nuevas credenciales; usa los archivos de `src/environments/` y mantén secretos fuera del repositorio.
- `src/app/core/types/database.types.ts` es generado: no lo edites manualmente. Usa `npm run db:types` cuando cambie el esquema.
- Las reglas de permisos deben vivir en Supabase/RLS, no solo en guards o condiciones de la UI.
- Para crear reservas de clientes usa la RPC `create_reservation`.
- Para cancelar reservas de clientes usa `cancel_my_reservation`.
- Para consultar disponibilidad usa `get_facility_availability` cuando aplique.
- No reemplaces estas RPC por inserts directos desde componentes o servicios sin una decisión explícita de arquitectura.
- Trata las fechas persistidas como ISO/`TIMESTAMPTZ`; evita offsets fijos como UTC-3 o UTC-4. Considera `America/Santiago`.
- La disponibilidad calculada en Angular es solo UX; PostgreSQL debe ser la autoridad frente a conflictos y concurrencia.

## Reservas

Los estados usados por la aplicación son `PENDING`, `CONFIRMED`, `CANCELLED` y `COMPLETED`. Las reservas activas que bloquean disponibilidad son `PENDING` y `CONFIRMED`.

Al tocar el flujo de reservas verifica: instalación activa, mantenimiento/cierre, horario operativo, slots, fechas pasadas, duración, conflictos y cancelación. Los errores de RPC deben traducirse a mensajes entendibles y no mostrarse crudos al usuario.

## Seguridad y configuración

No commits credenciales, tokens, contraseñas, service-role keys ni archivos de entorno privados. Revisa los cambios de configuración antes de incluirlos.

No asumas que `supabase/schema.sql` o migraciones están disponibles: comprueba los archivos presentes antes de documentar o modificar el esquema. Si una tarea requiere cambios de base de datos, deja claro qué migración/RPC/política debe crearse y valida el entorno enlazado antes de regenerar tipos.

## Flujo Git

Usa ramas con el formato definido por el proyecto, por ejemplo `feature/SPH-123-descripcion-corta` o `bugfix/SPH-456-descripcion-corta`. Los cambios deben pasar por Pull Request y referenciar la tarea de Jira cuando corresponda.

Antes de entregar:

1. Revisa el diff y confirma que no haya cambios accidentales.
2. Ejecuta el build y las pruebas relevantes.
3. Comprueba estados de carga, errores, permisos y responsive si cambió la UI.
4. Actualiza documentación solo cuando el comportamiento o la arquitectura hayan cambiado.
5. Resume archivos modificados, validaciones ejecutadas y cualquier limitación pendiente.

## Documentación de referencia

- `README.md`: visión general, flujo de trabajo y configuración.
- `docs/development/project-structure.md`: arquitectura por áreas.
- `docs/development/angular-supabase.md`: integración Angular/Supabase.
- `docs/architecture/database.md`: reglas del modelo y reservas.
- `docs/features/reservations.md`: comportamiento funcional de reservas.

