# Proceso de Desarrollo KontaFlow

## Checklist Detallado para Implementar Features

Este documento describe el proceso completo y repetible para desarrollar nuevas funcionalidades en KontaFlow.

---

## Fase 1: Diseño y Documentación

### 1.1. Diseño Funcional
**Documento**: `01-DISEÑO-FUNCIONAL.md`

- [ ] Definir el objetivo de la feature
- [ ] Identificar usuarios y roles involucrados
- [ ] Describir flujos de usuario (user stories)
- [ ] Definir reglas de negocio específicas
- [ ] Identificar validaciones requeridas
- [ ] Documentar casos especiales y restricciones
- [ ] Especificar mensajes de error esperados

**Ejemplo**: Para "Grupos Económicos" definimos:
- Quién puede crear/editar/eliminar grupos
- Qué sucede al crear un grupo (plan de cuentas + configuración automáticos)
- Restricciones (no eliminar grupos con empresas activas)
- Validaciones por país (UY debe usar UYU o USD)

---

### 1.2. Documentación Técnica
**Documento**: `02-DOCUMENTACIÓN-TÉCNICA.md`

- [ ] Definir entidades de base de datos necesarias
- [ ] Especificar relaciones entre entidades
- [ ] Definir campos, tipos de datos y restricciones
- [ ] Documentar índices necesarios
- [ ] Especificar API endpoints (métodos, rutas, params, responses)
- [ ] Definir códigos de error HTTP
- [ ] Documentar integraciones con servicios externos si aplica

**IMPORTANTE**: Si es la primera feature, definir la arquitectura del backend:
- [ ] Elegir patrón arquitectónico (ej: Capas - Routes → Services → Repositories)
- [ ] Definir estructura de carpetas
- [ ] Documentar responsabilidades de cada capa
- [ ] Especificar cómo fluye el manejo de errores
- [ ] Definir estrategia de logging

---

## Fase 2: Infraestructura y Setup

### 2.1. Docker y Servicios
**Archivo**: `docker-compose.yml`

- [ ] Definir servicio de base de datos (PostgreSQL)
- [ ] Configurar servicios adicionales necesarios:
  - [ ] Redis (caché/sesiones)
  - [ ] MinIO (almacenamiento S3)
  - [ ] MailHog (emails en desarrollo)
- [ ] Configurar volúmenes para persistencia
- [ ] Definir redes entre servicios
- [ ] Configurar healthchecks
- [ ] Definir variables de entorno

**Verificación**:
```bash
docker-compose up -d
docker-compose ps  # Todos los servicios deben estar "healthy"
```

---

### 2.2. Estructura de Proyectos

#### Backend
- [ ] Crear estructura de carpetas según arquitectura:
  ```
  backend/src/
  ├── lib/              # Utilidades compartidas
  │   ├── prisma.ts     # Cliente Prisma
  │   ├── logger.ts     # Logger estructurado
  │   ├── config.ts     # Validación de env vars
  │   └── errors.ts     # Jerarquía de errores
  ├── middleware/       # Middlewares globales
  │   ├── auth.ts
  │   └── error-handler.ts
  ├── validators/       # Schemas de validación (Zod)
  ├── repositories/     # Acceso a datos (Prisma)
  ├── services/         # Lógica de negocio
  └── routes/           # Endpoints HTTP
  ```

- [ ] Configurar TypeScript (`tsconfig.json`)
- [ ] Instalar dependencias base:
  ```bash
  npm install fastify @fastify/cors @fastify/helmet @fastify/rate-limit
  npm install @prisma/client prisma
  npm install zod pino pino-pretty
  npm install -D typescript @types/node tsx
  ```

#### Frontend
- [ ] Crear proyecto Next.js con TypeScript
- [ ] Instalar dependencias UI:
  ```bash
  npm install @clerk/nextjs
  npm install @tanstack/react-query axios
  npm install @radix-ui/react-* # Componentes necesarios
  npm install tailwindcss class-variance-authority clsx tailwind-merge
  npm install lucide-react
  ```
- [ ] Configurar Tailwind CSS
- [ ] Configurar estructura de carpetas:
  ```
  frontend/src/
  ├── app/              # App Router (Next.js)
  ├── components/       # Componentes reutilizables
  │   ├── ui/           # Componentes base (shadcn)
  │   └── features/     # Componentes de features
  ├── lib/              # Utilidades
  │   ├── api.ts        # Cliente HTTP
  │   └── utils.ts      # Helpers
  └── types/            # TypeScript types
  ```

---

### 2.3. Modelo de Datos
**Archivo**: `backend/prisma/schema.prisma`

- [ ] Definir modelos según documentación técnica
- [ ] Especificar tipos de datos Prisma
- [ ] Definir relaciones (1:1, 1:N, N:M)
- [ ] Agregar constraints (`@unique`, `@id`, `@default`)
- [ ] Definir índices para queries frecuentes (`@@index`)
- [ ] Agregar enums si corresponde
- [ ] Documentar campos con comentarios `///`

**Ejemplo**:
```prisma
model GrupoEconomico {
  id              Int       @id @default(autoincrement())
  nombre          String    @db.VarChar(200)
  rutControlador  String?   @db.VarChar(12)
  paisPrincipal   String    @db.VarChar(2)  // ISO 3166-1 alpha-2
  monedaBase      String    @db.VarChar(3)  // ISO 4217
  activo          Boolean   @default(true)
  fechaCreacion   DateTime  @default(now())

  // Relaciones
  empresas        Empresa[]
  planDeCuentas   PlanDeCuentas?
  configuracion   ConfiguracionContable?
  usuarios        UsuarioGrupo[]

  @@index([activo, paisPrincipal])
  @@map("grupos_economicos")
}
```

---

### 2.4. Migraciones
**Directorio**: `backend/prisma/migrations/`

- [ ] Crear migración inicial:
  ```bash
  npm run prisma:migrate -- --name init
  ```

- [ ] Para cambios incrementales:
  ```bash
  npm run prisma:migrate -- --name descripcion_cambio
  ```

- [ ] Verificar migración en `prisma/migrations/`
- [ ] Revisar SQL generado
- [ ] Aplicar migración:
  ```bash
  npm run prisma:migrate:deploy
  ```

- [ ] Generar cliente Prisma:
  ```bash
  npm run prisma:generate
  ```

**Verificación**:
```bash
# Conectar a PostgreSQL
docker exec -it kontaflow-postgres psql -U postgres -d kontaflow_dev
\dt  # Listar tablas
\d grupos_economicos  # Ver estructura de tabla
```

---

### 2.5. Datos Iniciales (Seed)
**Archivo**: `backend/prisma/seed.ts`

- [ ] Crear usuarios de prueba (diferentes roles)
- [ ] Crear grupo económico de ejemplo
- [ ] Crear empresas de ejemplo
- [ ] Crear datos relacionados necesarios
- [ ] Ejecutar seed:
  ```bash
  npm run prisma:seed
  ```

**Verificación**:
```sql
SELECT * FROM usuarios;
SELECT * FROM grupos_economicos;
SELECT * FROM empresas;
```

---

## Fase 3: Implementación por Feature

Para CADA feature nueva, seguir este proceso en orden:

### 3.1. BACKEND

#### 3.1.1. Fundamentos (Solo primera vez)

**Archivo**: `backend/src/lib/errors.ts`
- [ ] Definir jerarquía de errores customizados
- [ ] Crear clases: `AppError`, `ValidationError`, `NotFoundError`, `ForbiddenError`, `UnauthorizedError`, `ConflictError`, `BusinessRuleError`
- [ ] Implementar helpers: `handlePrismaError()`, `handleZodError()`

**Archivo**: `backend/src/lib/logger.ts`
- [ ] Configurar Pino logger
- [ ] Modo pretty para desarrollo, JSON para producción
- [ ] Request serializers para Fastify

**Archivo**: `backend/src/lib/config.ts`
- [ ] Validar variables de entorno con Zod
- [ ] Exportar configuración tipada
- [ ] Incluir: PORT, HOST, DATABASE_URL, NODE_ENV, etc.

**Archivo**: `backend/src/middleware/auth.ts`
- [ ] Implementar autenticación (Clerk JWT o simplificada para dev)
- [ ] Extraer usuario del token/header
- [ ] Validar usuario existe en BD
- [ ] Agregar `request.user` para uso en routes

**Archivo**: `backend/src/middleware/error-handler.ts`
- [ ] Implementar `errorHandler` global
- [ ] Manejar errores de Zod → 400
- [ ] Manejar errores de Prisma → 400/404/409
- [ ] Manejar errores customizados → status code apropiado
- [ ] Manejar errores inesperados → 500
- [ ] Implementar `notFoundHandler` para rutas no existentes

---

#### 3.1.2. Implementación de la Feature

**Archivo**: `backend/src/validators/<feature>.schema.ts`

- [ ] Definir schemas de validación con Zod
- [ ] Schema para CREATE (campos requeridos)
- [ ] Schema para UPDATE (todos opcionales)
- [ ] Schema para query params (paginación, filtros)
- [ ] Schema para route params (validar IDs)
- [ ] Exportar tipos TypeScript con `z.infer<>`
- [ ] Crear helpers de validación si necesario

**Ejemplo**:
```typescript
export const CreateGrupoSchema = z.object({
  nombre: z.string().min(3).max(200).trim(),
  rutControlador: z.string().regex(/^[0-9]{12}$/).optional().or(z.literal('')),
  paisPrincipal: z.enum(['UY', 'AR', 'BR', 'CL', ...]),
  monedaBase: z.enum(['UYU', 'USD', 'ARS', ...]),
});

export type CreateGrupoDto = z.infer<typeof CreateGrupoSchema>;
```

---

**Archivo**: `backend/src/repositories/<feature>.repository.ts`

- [ ] Implementar acceso a datos con Prisma
- [ ] Método `findMany()` con paginación y filtros
- [ ] Método `findById()` con relaciones
- [ ] Método `create()` con transacciones si necesario
- [ ] Método `update()`
- [ ] Método `delete()` (soft delete si aplica)
- [ ] Métodos auxiliares (verificar acceso, existencia, etc.)

**Patrón**:
```typescript
class GruposRepository {
  async findMany(filters, userId) {
    const where = { /* construir where clause */ };
    const [data, total] = await Promise.all([
      prisma.grupoEconomico.findMany({ where, skip, take, orderBy }),
      prisma.grupoEconomico.count({ where })
    ]);
    return { data, pagination: { page, limit, total, totalPages } };
  }

  async create(data, userId) {
    return await prisma.$transaction(async (tx) => {
      // Crear entidad principal + entidades relacionadas
    });
  }
}
```

---

**Archivo**: `backend/src/services/<feature>.service.ts`

- [ ] Implementar lógica de negocio
- [ ] Validaciones específicas de negocio
- [ ] Llamar a repository para operaciones de datos
- [ ] Logging de acciones importantes
- [ ] Manejo de errores de negocio (BusinessRuleError)
- [ ] Verificar permisos/acceso del usuario

**Patrón**:
```typescript
class GruposService {
  async crear(data: CreateGrupoDto, usuarioId: number) {
    // 1. Validaciones de negocio
    await this.validarDatosGrupo(data);

    // 2. Operación de datos
    const grupo = await gruposRepository.create(data, usuarioId);

    // 3. Logging
    logger.info({ action: 'grupo_creado', grupoId: grupo.id });

    // 4. Retornar resultado
    return grupo;
  }

  async eliminar(id: number, usuarioId: number) {
    // Validar reglas de negocio
    const empresasActivas = await verificarEmpresasActivas(id);
    if (empresasActivas > 0) {
      throw new BusinessRuleError(
        'No se puede eliminar un grupo con empresas activas',
        'EMPRESAS_ACTIVAS'
      );
    }
    return await gruposRepository.delete(id, usuarioId);
  }
}
```

---

**Archivo**: `backend/src/routes/<feature>.routes.ts`

- [ ] Definir endpoints HTTP
- [ ] Aplicar middleware de autenticación
- [ ] Parsear y validar request con Zod schemas
- [ ] Llamar a service con datos validados
- [ ] Retornar response con status code apropiado
- [ ] NO manejar errores (el error-handler lo hace)

**Patrón**:
```typescript
export async function gruposRoutes(fastify: FastifyInstance) {
  // Auth en todas las rutas
  fastify.addHook('preHandler', authenticateUser);

  // GET /api/grupos
  fastify.get('/', async (request, reply) => {
    const filters = ListGruposQuerySchema.parse(request.query);
    const result = await gruposService.listar(filters, request.user!.id);
    return reply.send(result);
  });

  // POST /api/grupos
  fastify.post('/', async (request, reply) => {
    const data = CreateGrupoSchema.parse(request.body);
    const grupo = await gruposService.crear(data, request.user!.id);
    return reply.code(201).send({
      data: grupo,
      message: 'Grupo económico creado correctamente'
    });
  });

  // ... otros endpoints
}
```

---

**Archivo**: `backend/src/index.ts`

- [ ] Registrar rutas de la feature:
  ```typescript
  await fastify.register(
    async (instance) => {
      await instance.register(gruposRoutes, { prefix: '/grupos' });
    },
    { prefix: '/api' }
  );
  ```

- [ ] Verificar que plugins, middleware y error handlers estén registrados

---

#### 3.1.3. Testing Sistemático de TODOS los Endpoints

**CRÍTICO**: Probar TODOS los endpoints, no solo el happy path.

- [ ] Health check funciona
- [ ] Para cada endpoint:
  - [ ] **GET** con diferentes combinaciones de query params
  - [ ] **GET** por ID (happy path)
  - [ ] **POST** con campos mínimos
  - [ ] **POST** con todos los campos
  - [ ] **PUT** actualizar diferentes campos
  - [ ] **DELETE** (verificar soft delete si aplica)

- [ ] Probar casos de error:
  - [ ] 401 - Sin autenticación (sin header)
  - [ ] 400 - Validación de cada campo (muy corto, muy largo, formato inválido, etc.)
  - [ ] 400 - País inválido
  - [ ] 400 - Moneda inválida
  - [ ] 400 - Otros formatos inválidos
  - [ ] 404 - Recurso no encontrado
  - [ ] 422 - Violación de reglas de negocio

**Método**:
```bash
# Probar happy paths
curl -H "x-user-id: 1" http://localhost:8000/api/grupos | jq
curl -H "x-user-id: 1" http://localhost:8000/api/grupos?page=1&limit=10 | jq
curl -H "x-user-id: 1" http://localhost:8000/api/grupos?search=texto | jq
curl -H "x-user-id: 1" http://localhost:8000/api/grupos/1 | jq

# Probar errores
curl http://localhost:8000/api/grupos/mis-grupos | jq  # 401
curl -X POST ... -d '{"nombre": "AB", ...}' | jq  # 400 - validación
curl -H "x-user-id: 1" http://localhost:8000/api/grupos/999 | jq  # 404
```

- [ ] Verificar en logs que no hay errores inesperados
- [ ] Verificar en base de datos que los cambios persisten correctamente

---

### 3.2. POSTMAN COLLECTION

**Archivo**: `postman/<Feature>.postman_collection.json`

- [ ] Crear colección con nombre descriptivo
- [ ] Configurar variables:
  - [ ] `base_url` = `http://localhost:8000`
  - [ ] `user_id` = `1` (usuario de prueba)
  - [ ] Variables específicas de la feature (ej: `grupo_id`)

- [ ] Crear request para cada endpoint:
  - [ ] Health check
  - [ ] Listar con paginación
  - [ ] Listar con filtros (ejemplos con query params deshabilitados)
  - [ ] Obtener por ID
  - [ ] Crear - caso completo
  - [ ] Crear - solo campos requeridos
  - [ ] Actualizar
  - [ ] Eliminar

- [ ] Crear requests de error:
  - [ ] Sin autenticación
  - [ ] Validación (nombre corto, país inválido, etc.)

- [ ] Agregar descriptions a cada request explicando qué hace

**Verificación**:
- [ ] Importar colección en Postman
- [ ] Ejecutar cada request manualmente
- [ ] Verificar responses coinciden con lo esperado

---

### 3.3. DOCUMENTACIÓN DE TESTING

**Archivo**: `TESTING.md` (o actualizar si ya existe)

- [ ] Instrucciones para importar colección Postman
- [ ] Variables configuradas y cómo cambiarlas
- [ ] Ejemplos de curl para cada endpoint
- [ ] Responses esperadas para cada caso
- [ ] Casos de error con ejemplos
- [ ] Datos de seed disponibles
- [ ] Queries SQL útiles para verificar en BD
- [ ] Checklist completo de testing

**Estructura sugerida**:
```markdown
# Testing API - [Feature]

## Colección de Postman
- Ubicación: `/postman/...`
- Cómo importar

## Testing desde Terminal (curl)
### Happy Path
- Listar
- Obtener por ID
- Crear
- Actualizar
- Eliminar

### Casos de Error
- 401, 400, 404, 422

## Datos de Prueba (Seed)
- Usuarios disponibles
- Datos pre-cargados

## Checklist de Testing
- [ ] Health check
- [ ] Endpoint 1
- [ ] Endpoint 2
- ...
```

---

### 3.4. FRONTEND

#### 3.4.1. Types y API Client

**Archivo**: `frontend/src/types/<feature>.ts`
- [ ] Definir interfaces TypeScript (sincronizadas con backend DTOs)
- [ ] Tipos para entidades
- [ ] Tipos para requests/responses
- [ ] Tipos para filtros y paginación

**Archivo**: `frontend/src/lib/api/<feature>.ts`
- [ ] Funciones para llamar a cada endpoint
- [ ] Usar axios o fetch con tipos correctos
- [ ] Manejar errores de red

**Ejemplo**:
```typescript
export async function getGrupos(params: ListGruposParams) {
  const response = await api.get<ListGruposResponse>('/api/grupos', { params });
  return response.data;
}

export async function createGrupo(data: CreateGrupoDto) {
  const response = await api.post<CreateGrupoResponse>('/api/grupos', data);
  return response.data;
}
```

---

#### 3.4.2. Componentes UI Base (si no existen)

Usar **shadcn/ui** para componentes base:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
npx shadcn-ui@latest add form
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add toast
```

---

#### 3.4.3. Página de Listado

**Archivo**: `frontend/src/app/<feature>/page.tsx`

- [ ] Crear layout de la página
- [ ] Header con título y botón "Crear nuevo"
- [ ] Implementar tabla/grid con datos
- [ ] Paginación (anterior/siguiente, info de página)
- [ ] Filtros (search, selects para enums, etc.)
- [ ] Loading states (skeletons)
- [ ] Empty states (sin datos)
- [ ] Error states (falló la carga)

**Funcionalidad**:
- [ ] Fetch data con React Query / SWR
- [ ] Debounce en search input
- [ ] Actualizar URL params con filtros
- [ ] Botones de acción por fila (Ver, Editar, Eliminar)
- [ ] Confirmación antes de eliminar
- [ ] Toast notifications para éxito/error

**Diseño**:
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Colores consistentes con tema
- [ ] Tipografía legible
- [ ] Spacing apropiado
- [ ] Hover states en botones/rows
- [ ] Focus states para accesibilidad

---

#### 3.4.4. Formulario Crear/Editar

**Archivo**: `frontend/src/components/features/<feature>/<Feature>Form.tsx`

- [ ] Usar React Hook Form para manejo de formulario
- [ ] Validación con Zod (mismo schema que backend)
- [ ] Campos para todos los datos editables
- [ ] Labels descriptivos
- [ ] Placeholders útiles
- [ ] Mensajes de error inline
- [ ] Loading state en submit
- [ ] Disabled state mientras guarda

**Funcionalidad**:
- [ ] Modo "create" vs "edit" (si ID existe)
- [ ] Pre-poblar datos en modo edit
- [ ] Submit llama a API correcta (POST vs PUT)
- [ ] Manejar errores de API (mostrar en form)
- [ ] Redirect o cerrar modal al éxito
- [ ] Toast de confirmación

**Diseño**:
- [ ] Form en modal/dialog o página separada
- [ ] Campos agrupados lógicamente
- [ ] Botones: Cancelar, Guardar
- [ ] Indicador de campos requeridos (*)
- [ ] Estilos consistentes con sistema de diseño

---

#### 3.4.5. Testing Manual del Frontend

- [ ] Listar: verificar paginación funciona
- [ ] Listar: verificar filtros funcionan
- [ ] Listar: verificar search funciona
- [ ] Ver detalle: click en row abre detalle
- [ ] Crear: formulario valida correctamente
- [ ] Crear: submit crea el recurso y actualiza lista
- [ ] Editar: pre-pobla datos correctos
- [ ] Editar: submit actualiza y refleja cambios
- [ ] Eliminar: pide confirmación
- [ ] Eliminar: elimina y actualiza lista
- [ ] Errores: muestra mensajes de error de API
- [ ] Loading: muestra spinners/skeletons apropiados
- [ ] Responsive: probar en mobile, tablet, desktop
- [ ] Accesibilidad: navegación con teclado, screen readers

---

## Fase 4: Integración y Commit

### 4.1. Verificación Final

- [ ] Backend funciona correctamente (todos los endpoints)
- [ ] Frontend funciona correctamente (CRUD completo)
- [ ] Postman collection tiene todos los requests
- [ ] TESTING.md está actualizado
- [ ] No hay errores en logs (backend y frontend)
- [ ] No hay warnings de TypeScript
- [ ] Código formateado (Prettier/ESLint)

---

### 4.2. Git Commit

- [ ] Revisar cambios con `git status`
- [ ] Revisar diff con `git diff`
- [ ] Agregar archivos:
  ```bash
  git add backend/src/
  git add backend/prisma/
  git add frontend/src/
  git add postman/
  git add TESTING.md
  git add PROCESO-DESARROLLO.md
  ```

- [ ] Crear commit descriptivo:
  ```bash
  git commit -m "feat(grupos): Implementar CRUD completo de Grupos Económicos

  Backend:
  - Validación con Zod (nombre, RUT, país, moneda)
  - CRUD completo con soft delete
  - Creación automática de plan de cuentas + configuración
  - Regla de negocio: no eliminar grupos con empresas activas

  Frontend:
  - Listado con paginación y filtros
  - Formulario crear/editar con validación
  - Confirmación para eliminar
  - Toast notifications

  Testing:
  - Colección Postman con 11 requests
  - TESTING.md actualizado
  - Todos los endpoints probados (happy path + errores)
  "
  ```

- [ ] Push a remote:
  ```bash
  git push origin main
  ```

---

## Resumen del Flujo Completo

```
1. DISEÑO FUNCIONAL (01-DISEÑO-FUNCIONAL.md)
   ↓
2. DOCUMENTACIÓN TÉCNICA (02-DOCUMENTACIÓN-TÉCNICA.md)
   - Definir arquitectura si es primera feature
   ↓
3. INFRAESTRUCTURA
   - Docker compose
   - Estructura de proyectos
   ↓
4. BASE DE DATOS
   - Prisma schema
   - Migraciones
   - Seed
   ↓
5. BACKEND (por feature)
   - Fundamentos (si es primera vez)
   - Validators (Zod schemas)
   - Repository (Prisma queries)
   - Service (lógica de negocio)
   - Routes (HTTP endpoints)
   - Integrar en index.ts
   ↓
6. TESTING BACKEND ⚠️ CRÍTICO
   - Probar TODOS los endpoints
   - Happy paths + error cases
   - Verificar en logs y BD
   ↓
7. POSTMAN COLLECTION
   - Todos los requests
   - Variables configuradas
   - Descriptions agregadas
   ↓
8. DOCUMENTACIÓN DE TESTING
   - Actualizar TESTING.md
   - Ejemplos de curl
   - Checklist
   ↓
9. FRONTEND (por feature)
   - Types + API client
   - Página de listado
   - Formulario crear/editar
   - Testing manual completo
   ↓
10. COMMIT
    - Verificación final
    - Commit descriptivo
    - Push a remote
```

---

## Errores Comunes a Evitar

### Backend
- ❌ No probar todos los endpoints (solo happy path)
- ❌ No validar con Zod antes de llamar a service
- ❌ Manejar errores en routes (debe hacerlo el error-handler)
- ❌ No usar transacciones cuando se crean múltiples entidades
- ❌ No hacer soft delete cuando corresponde
- ❌ No verificar permisos de usuario
- ❌ No loggear acciones importantes

### Frontend
- ❌ No manejar loading states
- ❌ No manejar error states
- ❌ No validar en cliente (además de servidor)
- ❌ No mostrar mensajes de confirmación
- ❌ No actualizar lista después de crear/editar/eliminar
- ❌ No hacer responsive
- ❌ No pensar en accesibilidad

### General
- ❌ Saltarse testing sistemático
- ❌ No documentar en TESTING.md
- ❌ No crear/actualizar Postman collection
- ❌ Commits con mensajes poco descriptivos
- ❌ No verificar en base de datos
- ❌ Dejar console.logs en producción

---

## Plantillas Útiles

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Error de validación en los datos enviados",
    "details": {
      "campo": ["Mensaje de error específico"]
    }
  }
}
```

### Success Response (List)
```json
{
  "data": [ /* array de items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

### Success Response (Create/Update)
```json
{
  "data": { /* objeto creado/actualizado */ },
  "message": "Operación exitosa"
}
```

### Success Response (Delete)
```json
{
  "success": true,
  "message": "Recurso eliminado correctamente"
}
```

---

## Recursos

### Documentación
- [Fastify](https://www.fastify.io/docs/latest/)
- [Prisma](https://www.prisma.io/docs)
- [Zod](https://zod.dev/)
- [Next.js](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)

### Herramientas
- [Postman](https://www.postman.com/)
- [DBeaver](https://dbeaver.io/) - Cliente PostgreSQL
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

---

**Última actualización**: 2025-11-02
**Versión**: 1.0

---

## Fase 3.5: Testing Automatizado (NUEVO)

### Implementación de Suite de Tests de Integración

Después del testing manual exitoso, implementar tests automatizados para asegurar la calidad del código y facilitar refactoring futuro.

#### 3.5.1. Setup de Testing

**Instalar dependencias**:
```bash
cd backend
npm install -D vitest @vitest/ui @vitest/coverage-v8
```

**Configurar Vitest** (`vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    globalSetup: ['./tests/global-setup.ts'],
    testTimeout: 10000,
    hookTimeout: 30000,
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'tests/', 'prisma/'],
    },
  },
});
```

**Configurar variables de entorno** (`.env.test`):
```env
NODE_ENV=test
DATABASE_URL=postgresql://postgres:dev_password@localhost:5432/kontaflow_test
PORT=9000
LOG_LEVEL=fatal  # Mínimo logging en tests
```

**Agregar scripts** (`package.json`):
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

#### 3.5.2. Estructura de Tests

```
backend/tests/
├── integration/           # Tests de API completos
│   └── <feature>/
│       ├── create.test.ts
│       ├── list.test.ts
│       ├── get-by-id.test.ts
│       ├── update.test.ts
│       └── delete.test.ts
│
├── utils/
│   ├── db-cleaner.ts     # Limpieza y seed de BD
│   └── test-server.ts    # Instancia de Fastify
│
├── factories/
│   └── <feature>.factory.ts  # Generación de datos de prueba
│
├── global-setup.ts       # Setup que se ejecuta UNA vez
└── setup.ts              # Setup por archivo de test
```

---

#### 3.5.3. Implementar Utilidades de Testing

**File**: `tests/global-setup.ts`
```typescript
// Crear DB test, aplicar migraciones, ejecutar seed
export default async function globalSetup() {
  // 1. Crear database kontaflow_test
  // 2. Aplicar migraciones (prisma migrate deploy)
  // 3. Limpiar tablas (TRUNCATE)
  // 4. Insertar seed data predecible
}
```

**File**: `tests/utils/db-cleaner.ts`
```typescript
export async function cleanDatabase() {
  // TRUNCATE todas las tablas en orden correcto
  const tables = ['lineas_asiento', 'asientos', 'cuentas', ...];
  for (const table of tables.reverse()) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`
    );
  }
}

export async function seedTestData() {
  // Crear usuarios, grupos, empresas con IDs predecibles
  const usuario1 = await prisma.usuario.create({
    data: { id: 1, email: 'admin@test.com', ... }
  });
  // ...
}
```

**File**: `tests/utils/test-server.ts`
```typescript
let testServerInstance: FastifyInstance | null = null;

export async function createTestServer() {
  if (testServerInstance) return testServerInstance;
  
  const fastify = Fastify({ logger: false });
  // Registrar plugins, middleware, routes
  testServerInstance = fastify;
  return fastify;
}
```

**File**: `tests/factories/<feature>.factory.ts`
```typescript
let counter = 1000;

export function buildGrupo(overrides?) {
  counter++;
  return {
    nombre: `Grupo Test ${counter}`,
    paisPrincipal: 'UY',
    monedaBase: 'UYU',
    ...overrides
  };
}

export const grupoPresets = {
  uruguay: () => buildGrupo({ paisPrincipal: 'UY', monedaBase: 'UYU' }),
  argentina: () => buildGrupo({ paisPrincipal: 'AR', monedaBase: 'ARS' }),
};
```

---

#### 3.5.4. Escribir Tests por Endpoint

**Estructura de archivo de test**:

```typescript
import { describe, it, expect } from 'vitest';
import { getTestServer } from '../../utils/test-server';
import { buildGrupo } from '../../factories/grupo.factory';
import { prisma } from '../../../src/lib/prisma';

describe('POST /api/grupos', () => {
  describe('Happy Paths', () => {
    it('debe crear un grupo con campos mínimos', async () => {
      const server = getTestServer();
      const grupoData = buildGrupo();

      const response = await server.inject({
        method: 'POST',
        url: '/api/grupos',
        headers: { 'x-user-id': '1' },
        payload: grupoData,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.data).toHaveProperty('id');
      expect(body.data.nombre).toBe(grupoData.nombre);
      expect(body.message).toBe('Grupo económico creado correctamente');
    });

    it('debe crear relaciones automáticamente', async () => {
      const server = getTestServer();
      const response = await server.inject({ ... });
      const grupoId = JSON.parse(response.body).data.id;

      // Verificar en BD
      const planDeCuentas = await prisma.planDeCuentas.findFirst({
        where: { grupoEconomicoId: grupoId }
      });
      expect(planDeCuentas).toBeDefined();
    });
  });

  describe('Validación de Errores', () => {
    it('debe retornar 401 sin autenticación', async () => { ... });
    it('debe retornar 400 si nombre es muy corto', async () => { ... });
    it('debe retornar 400 si país es inválido', async () => { ... });
  });
});
```

---

#### 3.5.5. Cobertura Mínima Requerida

Para cada endpoint, implementar tests de:

**Happy Paths**:
- [ ] Operación básica (campos mínimos)
- [ ] Operación completa (todos los campos)
- [ ] Variantes según negocio
- [ ] Verificar persistencia en BD
- [ ] Verificar efectos secundarios (creación de relaciones, logs, etc.)

**Validaciones (400)**:
- [ ] Cada campo requerido faltante
- [ ] Cada campo con formato inválido
- [ ] Cada campo fuera de rango (muy corto/largo, min/max)
- [ ] Combinaciones inválidas de campos

**Errores de Negocio**:
- [ ] 401 - Sin autenticación
- [ ] 403 - Sin permisos (si aplica)
- [ ] 404 - Recurso no encontrado
- [ ] 409 - Conflicto (duplicados, etc.)
- [ ] 422 - Violación de reglas de negocio

---

#### 3.5.6. Ejecutar Tests

**Durante desarrollo**:
```bash
npm run test:watch
```

**Antes de commit**:
```bash
npm test
```

**Verificar coverage**:
```bash
npm run test:coverage
```

**Target**: Mínimo 80% de coverage en services y routes.

---

#### 3.5.7. Debugging de Tests

**Ver solo tests fallando**:
```bash
npm test 2>&1 | grep "FAIL"
```

**Correr solo un archivo**:
```bash
npx vitest run tests/integration/grupos/create.test.ts
```

**Correr solo un test**:
```typescript
it.only('debe crear un grupo', async () => {
  // Solo este test se ejecuta
});
```

**Ver datos en BD de test**:
```bash
docker exec -it kontaflow-db psql -U postgres -d kontaflow_test
\dt  # Listar tablas
SELECT * FROM grupos_economicos;
```

---

#### 3.5.8. Beneficios de Testing Automatizado

✅ **Detección temprana de bugs**: Errores se detectan antes de llegar a producción  
✅ **Refactoring seguro**: Cambiar código con confianza  
✅ **Documentación viva**: Tests muestran cómo usar el API  
✅ **Regression prevention**: Evita que bugs viejos regresen  
✅ **CI/CD Ready**: Automatizable en pipelines  
✅ **Velocidad**: Suite completa en ~2 segundos  
✅ **Confianza**: Deploy con seguridad

---

#### 3.5.9. Integración con Flujo de Desarrollo

**Nuevo flujo por feature**:

```
1. Diseño Funcional
2. Documentación Técnica
3. Modelo de Datos + Migraciones
4. BACKEND Implementación
5. TESTING MANUAL (todos los endpoints)  ← Igual que antes
6. TESTS AUTOMATIZADOS (nueva etapa)     ← NUEVO
   - Escribir tests para todos los casos
   - Ejecutar suite completa
   - Verificar coverage mínimo 80%
7. Postman Collection
8. Frontend Implementación
9. Testing Manual Frontend
10. Commit
```

**IMPORTANTE**: Los tests automatizados NO reemplazan el testing manual inicial. Primero probamos manualmente para validar el diseño, luego automatizamos para mantener la calidad.

---

## Fase 3.6: Frontend UI/UX Best Practices (NUEVO)

### 3.6.1. Sistema de Diseño

#### Paleta de Colores

**Definida en** `frontend/app/globals.css`:

```css
:root {
  /* Color primario - Globe Software: rgb(204, 153, 255) = #CC99FF */
  --primary: 270 100% 65%;
  --primary-foreground: 0 0% 100%;

  /* Secundarios */
  --secondary: 270 30% 95%;
  --accent: 270 60% 92%;

  /* Estados */
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --destructive: 0 84% 60%;

  /* Grises */
  --muted: 210 40% 96%;
  --border: 214 32% 91%;
}
```

**Aplicación**: Usar variables CSS en lugar de colores hardcodeados
```tsx
// ✅ Correcto
<div className="bg-primary text-primary-foreground">

// ❌ Incorrecto
<div className="bg-purple-400 text-white">
```

#### Tipografía

```css
:root {
  --font-sans: 'Inter', system-ui, sans-serif;
}

/* Escalas recomendadas */
.text-xs    /* 0.75rem - 12px - Hints, footnotes */
.text-sm    /* 0.875rem - 14px - Secondary text, labels */
.text-base  /* 1rem - 16px - Body text */
.text-lg    /* 1.125rem - 18px - Destacados */
.text-xl    /* 1.25rem - 20px - Subtítulos */
.text-2xl   /* 1.5rem - 24px - Títulos de página */
```

#### Espaciado

**Principio**: Aplicaciones financieras requieren **alta densidad de información**

```tsx
// ❌ MAL - Mucho espacio vertical desperdiciado
<TableRow className="py-6">
  <TableCell className="p-6">

// ✅ BIEN - Compacto pero legible
<TableRow className="py-2">
  <TableCell className="p-3">
```

**Contenedores estándar**:
```tsx
<div className="container mx-auto py-6 px-6">
  {/* Contenido de página */}
</div>
```

#### Iconografía

**Biblioteca**: lucide-react (consistente con shadcn/ui)

```tsx
import {
  Building2,      // Grupos Económicos
  Building,       // Empresas
  FileText,       // Comprobantes
  BookOpen,       // Plan de Cuentas
  BarChart3,      // Reportes
  Settings,       // Configuración
  Plus,           // Crear
  Edit2,          // Editar
  Trash2,         // Eliminar
  Search,         // Buscar
  Filter,         // Filtrar
  CheckCircle2,   // Activo/Success
  XCircle,        // Inactivo/Error
  AlertCircle,    // Advertencia
  Loader2,        // Loading
  MoreVertical,   // Menú acciones
} from 'lucide-react';
```

**Tamaños consistentes**:
```tsx
<Icon className="h-4 w-4" />  // Estándar: botones, menús
<Icon className="h-5 w-5" />  // Headers de card
<Icon className="h-6 w-6" />  // Logo
<Icon className="h-8 w-8" />  // Loading states, empty states
```

---

### 3.6.2. Componentes de Layout

#### Header

**Archivo**: `frontend/src/components/layout/header.tsx`

**Elementos obligatorios**:
- Logo (esquina superior izquierda)
- Información del usuario (esquina superior derecha)
- Selector de idioma (próximo a implementar)

```tsx
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-16 items-center px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">KontaFlow</h1>
        </div>

        {/* Usuario y selector de idioma */}
        <div className="ml-auto flex items-center gap-4">
          {/* Selector de idioma aquí */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
```

#### Sidebar (Navegación)

**Archivo**: `frontend/src/components/layout/sidebar.tsx`

**Consideraciones**:
- Ancho fijo en desktop (250-280px)
- Colapsable en mobile (drawer/sheet)
- Items activos visualmente destacados
- Iconos consistentes

```tsx
const menuItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/grupos', icon: Building2, label: 'Grupos Económicos' },
  { href: '/empresas', icon: Building, label: 'Empresas' },
  { href: '/comprobantes', icon: FileText, label: 'Comprobantes' },
  { href: '/cuentas', icon: BookOpen, label: 'Plan de Cuentas' },
  { href: '/reportes', icon: BarChart3, label: 'Reportes' },
  { href: '/configuracion', icon: Settings, label: 'Configuración' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white">
      <nav className="space-y-1 p-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
              pathname === item.href
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-gray-50 text-gray-700"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

#### MainLayout

**Archivo**: `frontend/src/components/layout/main-layout.tsx`

```tsx
export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

### 3.6.3. Tablas de Datos

**Mejores prácticas implementadas**:

```tsx
export function DataTable({ items }: Props) {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow
              key={item.id}
              className={cn(
                "group transition-colors hover:bg-primary/5",
                // Zebra striping con tonos pastel
                index % 2 === 0 ? "bg-white" : "bg-primary/3"
              )}
            >
              <TableCell className="font-medium py-2">
                {item.nombre}
              </TableCell>

              <TableCell className="py-2">
                <Badge variant={item.activo ? "success" : "secondary"}>
                  {item.activo ? (
                    <><CheckCircle2 className="h-3 w-3 mr-1" /> Activo</>
                  ) : (
                    <><XCircle className="h-3 w-3 mr-1" /> Inactivo</>
                  )}
                </Badge>
              </TableCell>

              <TableCell className="text-right py-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/items/${item.id}`)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(item)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

**Características clave**:
- ✅ Zebra striping con tonos pastel (`bg-primary/3`)
- ✅ Hover states (`hover:bg-primary/5`)
- ✅ Altura de fila reducida (`py-2`)
- ✅ Dropdown menu para acciones
- ✅ Badges con iconos para estados
- ✅ Bordes redondeados y sombras suaves

---

### 3.6.4. Optimizaciones de Performance

#### Debouncing en Búsquedas

**Problema**: Cada keystroke dispara un request al servidor → 5 requests al escribir "Globe"

**Solución**: Hook personalizado de debounce

**Archivo**: `frontend/src/hooks/useDebounce.ts`
```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

**Uso en componente**:
```tsx
const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebounce(searchInput, 400);

useEffect(() => {
  setFilters(prev => ({
    ...prev,
    search: debouncedSearch,
    page: 1  // Reset a página 1 al buscar
  }));
}, [debouncedSearch]);

// Input muestra valor inmediato
<Input
  value={searchInput}
  onChange={(e) => setSearchInput(e.target.value)}
/>
```

#### Estados de Carga Separados

**Problema**: Stats cards y toda la página se recargan en cada búsqueda

**Solución**: Separar loading inicial de búsquedas subsecuentes

```tsx
const [isInitialLoading, setIsInitialLoading] = useState(true);
const [isSearching, setIsSearching] = useState(false);

const loadData = async (showSearchIndicator = false) => {
  if (showSearchIndicator) {
    setIsSearching(true);
  } else {
    setIsInitialLoading(true);
  }

  try {
    const response = await api.list(filters);
    setData(response.data);
  } finally {
    setIsInitialLoading(false);
    setIsSearching(false);
  }
};

// En el render
{/* Loading inicial - pantalla completa */}
{isInitialLoading && <LoadingSkeleton />}

{/* Stats cards - solo mostrar después de carga inicial */}
{!isInitialLoading && <StatsCards data={data} />}

{/* Tabla - con indicador de búsqueda */}
{!isInitialLoading && (
  <div className="relative">
    {isSearching && (
      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
    )}
    <DataTable data={data} />
  </div>
)}
```

---

### 3.6.5. Estrategia de ABM (Alta/Baja/Modificación)

**Patrón Híbrido** según complejidad de la entidad:

#### Sheet (Drawer Lateral) - Para entidades simples
**Usar cuando**:
- 3-6 campos
- Sin relaciones complejas
- Formulario rápido

**Ejemplos**: Grupos Económicos, Empresas, Monedas, Tipos de Cuenta

```tsx
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetContent side="right" className="w-full sm:max-w-[540px] overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Crear Grupo Económico</SheetTitle>
    </SheetHeader>
    {/* Formulario */}
  </SheetContent>
</Sheet>
```

#### Página Completa - Para entidades complejas
**Usar cuando**:
- Más de 6 campos
- Múltiples tabs/secciones
- Relaciones complejas
- Necesita más espacio visual

**Ejemplos**: Comprobantes Contables, Configuración, Reportes

```tsx
// app/comprobantes/[id]/page.tsx
export default function ComprobantePage() {
  return (
    <MainLayout>
      <Tabs>
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="lineas">Líneas de Asiento</TabsTrigger>
          <TabsTrigger value="adjuntos">Adjuntos</TabsTrigger>
        </TabsList>
        {/* Contenido de tabs */}
      </Tabs>
    </MainLayout>
  );
}
```

---

## Fase 3.7: Internacionalización (i18n) (NUEVO)

### 3.7.1. Idiomas Soportados

- 🇪🇸 Español (es) - Default
- 🇧🇷 Português (pt-BR)
- 🇺🇸 English (en)

### 3.7.2. Setup con next-intl

**Instalar dependencia**:
```bash
cd frontend
npm install next-intl
```

**Estructura de archivos**:
```
frontend/
├── messages/
│   ├── es.json
│   ├── pt.json
│   └── en.json
├── middleware.ts
├── i18n.ts
└── app/
    └── [locale]/
        ├── layout.tsx
        └── grupos/
            └── page.tsx
```

---

### 3.7.3. Configuración

**Archivo**: `frontend/i18n.ts`
```typescript
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['es', 'pt', 'en'] as const;
export const defaultLocale = 'es';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
```

**Archivo**: `frontend/middleware.ts`
```typescript
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // URLs: /es/grupos, /pt/grupos, /en/grupos
});

export const config = {
  matcher: ['/', '/(es|pt|en)/:path*']
};
```

---

### 3.7.4. Archivos de Mensajes

**Archivo**: `frontend/messages/es.json`
```json
{
  "common": {
    "create": "Crear",
    "edit": "Editar",
    "delete": "Eliminar",
    "save": "Guardar",
    "cancel": "Cancelar",
    "search": "Buscar",
    "active": "Activo",
    "inactive": "Inactivo",
    "loading": "Cargando...",
    "noResults": "No hay resultados",
    "confirmDelete": "¿Estás seguro de eliminar?"
  },
  "grupos": {
    "title": "Grupos Económicos",
    "description": "Gestiona tus grupos económicos y empresas",
    "createButton": "Crear Grupo",
    "editTitle": "Editar Grupo",
    "fields": {
      "nombre": "Nombre",
      "nombrePlaceholder": "Ej: Grupo Pragmatic",
      "paisPrincipal": "País Principal",
      "monedaBase": "Moneda Base"
    },
    "messages": {
      "created": "Grupo económico creado correctamente",
      "updated": "Grupo económico actualizado correctamente",
      "deleted": "Grupo económico eliminado correctamente",
      "loadError": "Error al cargar grupos"
    },
    "errors": {
      "nombreRequired": "El nombre es requerido",
      "nombreTooShort": "El nombre debe tener al menos 3 caracteres",
      "nombreTooLong": "El nombre no puede exceder 200 caracteres",
      "paisRequired": "Selecciona un país",
      "monedaRequired": "Selecciona una moneda"
    }
  }
}
```

**Archivo**: `frontend/messages/pt.json`
```json
{
  "common": {
    "create": "Criar",
    "edit": "Editar",
    "delete": "Excluir",
    "save": "Salvar",
    "cancel": "Cancelar",
    "search": "Pesquisar",
    "active": "Ativo",
    "inactive": "Inativo",
    "loading": "Carregando...",
    "noResults": "Nenhum resultado encontrado",
    "confirmDelete": "Tem certeza que deseja excluir?"
  },
  "grupos": {
    "title": "Grupos Econômicos",
    "description": "Gerencie seus grupos econômicos e empresas",
    "createButton": "Criar Grupo",
    "editTitle": "Editar Grupo",
    "fields": {
      "nombre": "Nome",
      "nombrePlaceholder": "Ex: Grupo Pragmatic",
      "paisPrincipal": "País Principal",
      "monedaBase": "Moeda Base"
    },
    "messages": {
      "created": "Grupo econômico criado com sucesso",
      "updated": "Grupo econômico atualizado com sucesso",
      "deleted": "Grupo econômico excluído com sucesso",
      "loadError": "Erro ao carregar grupos"
    }
  }
}
```

**Archivo**: `frontend/messages/en.json`
```json
{
  "common": {
    "create": "Create",
    "edit": "Edit",
    "delete": "Delete",
    "save": "Save",
    "cancel": "Cancel",
    "search": "Search",
    "active": "Active",
    "inactive": "Inactive",
    "loading": "Loading...",
    "noResults": "No results found",
    "confirmDelete": "Are you sure you want to delete?"
  },
  "grupos": {
    "title": "Economic Groups",
    "description": "Manage your economic groups and companies",
    "createButton": "Create Group",
    "editTitle": "Edit Group",
    "fields": {
      "nombre": "Name",
      "nombrePlaceholder": "Ex: Pragmatic Group",
      "paisPrincipal": "Main Country",
      "monedaBase": "Base Currency"
    },
    "messages": {
      "created": "Economic group created successfully",
      "updated": "Economic group updated successfully",
      "deleted": "Economic group deleted successfully",
      "loadError": "Error loading groups"
    }
  }
}
```

---

### 3.7.5. Uso en Componentes

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { Plus, Search } from 'lucide-react';

export default function GruposPage() {
  const t = useTranslations('grupos');
  const tCommon = useTranslations('common');

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-sm text-gray-600">{t('description')}</p>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Input
              placeholder={`${tCommon('search')}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              {t('createButton')}
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <DataTable items={grupos} />

        {/* Mensajes de éxito/error */}
        {success && toast.success(t('messages.created'))}
        {error && toast.error(t('messages.loadError'))}
      </div>
    </MainLayout>
  );
}
```

---

### 3.7.6. Selector de Idioma en Header

**Archivo**: `frontend/src/components/layout/language-selector.tsx`

```tsx
'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const languages = {
  es: { label: 'Español', flag: '🇪🇸' },
  pt: { label: 'Português', flag: '🇧🇷' },
  en: { label: 'English', flag: '🇺🇸' },
};

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (newLocale: string) => {
    // Reemplazar locale en URL: /es/grupos → /pt/grupos
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Languages className="h-4 w-4 mr-2" />
          {languages[locale as keyof typeof languages].flag}
          <span className="ml-1">
            {locale.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, { label, flag }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => changeLanguage(code)}
            className={locale === code ? 'bg-primary/10' : ''}
          >
            <span className="mr-2">{flag}</span>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Integrar en Header**:
```tsx
import { LanguageSelector } from './language-selector';

export function Header() {
  return (
    <header className="...">
      <div className="flex h-16 items-center px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">...</div>

        {/* Usuario y selector de idioma */}
        <div className="ml-auto flex items-center gap-4">
          <LanguageSelector />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
```

---

### 3.7.7. Validaciones Traducidas

Para mensajes de validación del backend, usar headers de Accept-Language:

**Frontend API Client**:
```typescript
private getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Accept-Language': locale, // 'es', 'pt', 'en'
    ...(config.isDevelopment ? { 'x-user-id': '1' } : {}),
  };
}
```

**Backend Validators** (futuro):
Implementar mensajes de error traducidos en Zod schemas:
```typescript
export const CreateGrupoSchema = z.object({
  nombre: z.string()
    .min(3, { message: getTranslation('grupos.errors.nombreTooShort') })
    .max(200, { message: getTranslation('grupos.errors.nombreTooLong') }),
});
```

---

### 3.7.8. Checklist de i18n por Feature

- [ ] Crear claves de traducción en `messages/es.json`
- [ ] Traducir a portugués en `messages/pt.json`
- [ ] Traducir a inglés en `messages/en.json`
- [ ] Usar `useTranslations()` en componentes
- [ ] Traducir labels de formulario
- [ ] Traducir placeholders
- [ ] Traducir mensajes de éxito/error
- [ ] Traducir textos de botones
- [ ] Traducir headers de tabla
- [ ] Traducir mensajes de confirmación
- [ ] Probar cambio de idioma en tiempo real
- [ ] Verificar que no queden textos hardcodeados

---

## Resumen del Flujo ACTUALIZADO

```
1. DISEÑO FUNCIONAL
2. DOCUMENTACIÓN TÉCNICA + Arquitectura (si es primera feature)
3. INFRAESTRUCTURA (Docker, proyectos, DB, migrations, seed)
4. BACKEND (validators, repository, service, routes)
5. TESTING MANUAL ⚠️ CRÍTICO - Todos los endpoints
6. TESTS AUTOMATIZADOS 🆕 - Suite completa
7. POSTMAN COLLECTION
8. DOCUMENTACIÓN DE TESTING
9. FRONTEND (types, API client, listado, formularios)
   - Aplicar Sistema de Diseño (colores, tipografía, iconos)
   - Implementar Layout (Header, Sidebar, MainLayout)
   - Optimizaciones (debouncing, loading states)
   - ABM según complejidad (Sheet vs Page)
   - Implementar i18n (traducciones en 3 idiomas)
10. TESTING MANUAL FRONTEND
11. COMMIT
```

---

**Última actualización**: 2025-11-02
**Versión**: 1.2 (Agregado: UI/UX Best Practices e i18n)

