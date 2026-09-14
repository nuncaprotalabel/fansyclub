# FANSYCLUB — Fase 001 Foundation

## Alcance

Esta fase establece la base técnica de una plataforma multi-tenant. Incluye autenticación por sesiones, autorización por roles, Worlds, routing conceptual y estructuras iniciales para auditoría y seguridad. No incluye pagos, constructor visual, tienda, música, comunidades ni analytics avanzado.

## Arquitectura

- **Frontend:** React + Vite + TypeScript en `artifacts/fansyclub`.
- **Backend:** Express 5 + TypeScript en `artifacts/api-server`.
- **Contrato:** `lib/api-spec/openapi.yaml` genera hooks React Query y esquemas Zod.
- **Persistencia:** PostgreSQL mediante Drizzle ORM en `lib/db`.
- **Sesiones:** cookie HttpOnly con token opaco; solo el hash HMAC del token se persiste.
- **Ruteo:** la API vive bajo `/api`; el frontend usa el proxy del artefacto.

## Estructura

```text
artifacts/
  api-server/
    src/lib/              # sesiones, autorización, auditoría
    src/middlewares/      # rate limit de autenticación
    src/routes/           # auth, Worlds, access, health
  fansyclub/
    src/App.tsx           # rutas y experiencia web
    src/index.css         # tokens y estilos globales
lib/
  api-spec/openapi.yaml   # contrato fuente
  api-client-react/       # cliente generado
  api-zod/                # validación generada
  db/src/schema/          # modelos Drizzle
```

## Modelos

- `users`: identidad, estado, rol y `password_hash`.
- `sessions`: sesiones revocables con expiración.
- `worlds`: World, owner y slug único.
- `world_memberships`: relación evolutiva entre usuarios y Worlds.
- `audit_logs`: acciones administrativas y de recursos.
- `security_events`: eventos de autenticación y seguridad.

## Rutas API

- `GET /api/healthz`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/worlds`
- `POST /api/worlds`
- `GET /api/worlds/:slug`
- `GET /api/access/check?permission=...`

## Variables de entorno

```text
DATABASE_URL=...
SESSION_SECRET=...
PORT=...       # gestionado por el workflow
BASE_PATH=/    # gestionado por el workflow web
```

No se guardan secretos en el código ni en el repositorio.

## Ejecución

```bash
pnpm install
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/db run push
pnpm run typecheck
```

Los workflows administrados inician el API y el frontend. Para una compilación Vite manual:

```bash
PORT=18831 BASE_PATH=/ pnpm --filter @workspace/fansyclub run build
```

## Migraciones / base de datos

El esquema de desarrollo se aplica con:

```bash
pnpm --filter @workspace/db run push
```

La base PostgreSQL ya está provisionada para el proyecto. El flujo de publicación gestiona la aplicación del esquema de desarrollo a producción.

## Pruebas realizadas

- `pnpm run typecheck`
- Build de producción Vite con `PORT` y `BASE_PATH`
- `GET /api/healthz` devuelve `200`
- Rutas privadas sin sesión devuelven `401`
- Registro válido, creación/listado de World, logout y protección posterior a logout
- Registro inválido devuelve `422`

No se incluyeron datos ficticios permanentes ni un script de seed.