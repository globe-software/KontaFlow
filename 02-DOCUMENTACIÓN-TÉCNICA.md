# SISTEMA DE CONTABILIDAD - DOCUMENTACIÓN TÉCNICA

> **Guía Técnica Completa de Implementación**  
> Versión 1.0 - Noviembre 2025

---

## 📋 TABLA DE CONTENIDOS

1. [Stack Tecnológico](#stack-tecnológico)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Servicios Cloud](#servicios-cloud)
4. [Desarrollo Local con Docker](#desarrollo-local-con-docker)
5. [Base de Datos](#base-de-datos)
6. [Modelo de Datos SQL](#modelo-de-datos-sql)
7. [APIs y Endpoints](#apis-y-endpoints)
8. [Autenticación y Seguridad](#autenticación-y-seguridad)
9. [Deployment](#deployment)
10. [Monitoreo y Logs](#monitoreo-y-logs)

---

## 1. STACK TECNOLÓGICO

### 1.1 Resumen Ejecutivo

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  Next.js 14 + React 18 + TypeScript                │
│  TailwindCSS + shadcn/ui                           │
│  Deploy: Vercel                                     │
└──────────────────────────────────────────────────────┘
                      ↓ REST API
┌──────────────────────────────────────────────────────┐
│                    BACKEND                           │
│  Node.js 20 + TypeScript                           │
│  Fastify + Prisma ORM                              │
│  Deploy: Railway                                    │
└──────────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────────┐
│                   DATABASE                           │
│  PostgreSQL 15                                      │
│  Service: Supabase                                  │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│              SERVICIOS EXTERNOS                      │
│  • Auth: Clerk.dev                                  │
│  • Email: Resend                                    │
│  • Storage: Cloudflare R2                          │
│  • Queue: Upstash Redis + BullMQ                   │
│  • Monitoring: Sentry + Axiom                      │
└──────────────────────────────────────────────────────┘
```

### 1.2 Justificación de Elecciones

**Por qué JavaScript/TypeScript:**
- Lenguaje único frontend + backend (código compartido)
- Type-safety end-to-end
- Ecosistema maduro para aplicaciones web
- Performance excelente para operaciones I/O (base de datos, APIs)
- Mejor para tiempo real y concurrencia

**Por qué Managed Services:**
- Reducir tiempo de setup (días vs semanas)
- Costo inicial bajo ($25-100/mes vs $150+)
- Mantenimiento automático (actualizaciones, backups)
- Escalabilidad automática
- Enfoque en features, no en infraestructura

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNET                             │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┴─────────────────┐
        │                                  │
        ↓                                  ↓
┌───────────────┐                 ┌────────────────┐
│   VERCEL      │                 │   RAILWAY      │
│  (Frontend)   │────── API ─────→│   (Backend)    │
│               │                 │                │
│ - Next.js     │                 │ - Fastify      │
│ - Static      │                 │ - Prisma       │
│ - Edge Fn     │                 │ - Workers      │
└───────────────┘                 └────────┬───────┘
                                           │
                    ┌──────────────────────┴──────────┐
                    │                                 │
                    ↓                                 ↓
          ┌─────────────────┐              ┌──────────────────┐
          │   SUPABASE      │              │  UPSTASH REDIS   │
          │  (PostgreSQL)   │              │  (Queue/Cache)   │
          └─────────────────┘              └──────────────────┘
                    │
                    ↓
          ┌─────────────────┐
          │  CLOUDFLARE R2  │
          │   (Storage)     │
          └─────────────────┘
```

### 2.2 Flujo de Datos

```
Usuario (Browser)
    ↓
Next.js Frontend (Vercel)
    ↓ fetch('/api/...')
Fastify Backend (Railway)
    ↓ Prisma queries
PostgreSQL (Supabase)
    ↓ Results
Backend procesa
    ↓ JSON response
Frontend renderiza
    ↓
Usuario ve resultado
```

### 2.3 Multi-Tenancy

```
Nivel de aislamiento: Row-Level Security (RLS)

Query de Usuario:
SELECT * FROM asientos WHERE empresa_id = 5

PostgreSQL aplica RLS automáticamente:
→ Verifica que usuario tiene acceso a empresa_id = 5
→ Si tiene acceso: retorna datos
→ Si no: retorna vacío (sin error)

Ventajas:
✓ Imposible ver datos de otros grupos económicos
✓ Implementado en DB (última línea de defensa)
✓ Performance (índices por tenant)
```

### 2.4 Arquitectura Interna del Backend

#### Patrón: Arquitectura por Capas (Layered Architecture)

El backend sigue una arquitectura en capas que separa responsabilidades y facilita el mantenimiento, testing y escalabilidad.

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend)                        │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP Request
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                   CAPA DE RUTAS (Routes)                     │
│  • Maneja requests HTTP (GET, POST, PUT, DELETE)            │
│  • Validación de entrada (Zod schemas)                      │
│  • Autenticación y autorización                             │
│  • Transformación de respuestas                             │
│  Archivos: routes/*.routes.ts                               │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                 CAPA DE SERVICIOS (Services)                 │
│  • Lógica de negocio                                        │
│  • Reglas de validación complejas                           │
│  • Orquestación de múltiples repositorios                   │
│  • Cálculos y transformaciones                              │
│  Archivos: services/*.service.ts                            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│              CAPA DE REPOSITORIOS (Repositories)             │
│  • Acceso a datos (Prisma queries)                          │
│  • Abstracción de la base de datos                          │
│  • Operaciones CRUD específicas                             │
│  • Queries complejas                                        │
│  Archivos: repositories/*.repository.ts                     │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                      PRISMA ORM                              │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                             │
│                    PostgreSQL 15                             │
└─────────────────────────────────────────────────────────────┘
```

#### Estructura de Carpetas

```
backend/src/
├── index.ts                      # Entry point - Configuración de Fastify
│
├── routes/                       # Capa HTTP (Controllers)
│   ├── grupos.routes.ts          # Endpoints de grupos económicos
│   ├── empresas.routes.ts        # Endpoints de empresas
│   ├── cuentas.routes.ts         # Endpoints de plan de cuentas
│   ├── asientos.routes.ts        # Endpoints de asientos contables
│   ├── clientes.routes.ts        # Endpoints de clientes
│   ├── proveedores.routes.ts     # Endpoints de proveedores
│   └── reportes.routes.ts        # Endpoints de reportes
│
├── services/                     # Lógica de Negocio
│   ├── grupos.service.ts         # Lógica de grupos
│   ├── empresas.service.ts       # Lógica de empresas
│   ├── cuentas.service.ts        # Lógica de cuentas
│   ├── asientos.service.ts       # Lógica de asientos (validación partida doble)
│   ├── obligaciones.service.ts   # Lógica de obligaciones y cuotas
│   └── reportes.service.ts       # Generación de reportes
│
├── repositories/                 # Acceso a Datos
│   ├── grupos.repository.ts      # Queries de grupos
│   ├── asientos.repository.ts    # Queries de asientos
│   ├── cuentas.repository.ts     # Queries de cuentas
│   └── reportes.repository.ts    # Queries complejas para reportes
│
├── middleware/                   # Middleware de Fastify
│   ├── auth.ts                   # Autenticación JWT (Clerk)
│   ├── error-handler.ts          # Manejo centralizado de errores
│   ├── validate.ts               # Validación con Zod
│   └── tenant.ts                 # Multi-tenancy (verificar acceso)
│
├── validators/                   # Schemas de Validación (Zod)
│   ├── grupos.schema.ts          # Validaciones de grupos
│   ├── empresas.schema.ts        # Validaciones de empresas
│   ├── cuentas.schema.ts         # Validaciones de cuentas
│   └── asientos.schema.ts        # Validaciones de asientos
│
├── lib/                         # Utilidades y Configuración
│   ├── prisma.ts                # Cliente Prisma singleton
│   ├── errors.ts                # Clases de errores custom
│   ├── logger.ts                # Logger (Pino)
│   └── config.ts                # Configuración (env vars)
│
└── types/                       # TypeScript Types
    ├── index.ts                 # Types exportados
    └── fastify.d.ts             # Type augmentation para Fastify
```

#### Responsabilidades de Cada Capa

**1. Routes (Controllers)**
```typescript
// Ejemplo: routes/asientos.routes.ts
export async function asientosRoutes(fastify: FastifyInstance) {
  // GET /api/asientos
  fastify.get('/', {
    preHandler: [authenticateUser, validateTenant],
    schema: {
      querystring: AsientosQuerySchema
    }
  }, async (request, reply) => {
    const asientos = await asientosService.listar(
      request.user.grupoEconomicoId,
      request.query
    );
    return { data: asientos };
  });

  // POST /api/asientos
  fastify.post('/', {
    preHandler: [authenticateUser, validateTenant],
    schema: {
      body: CreateAsientoSchema
    }
  }, async (request, reply) => {
    const asiento = await asientosService.crear(
      request.user.grupoEconomicoId,
      request.body
    );
    return reply.code(201).send({ data: asiento });
  });
}
```

**Responsabilidades:**
- Recibir y validar requests HTTP
- Llamar a servicios
- Transformar respuestas
- Manejo de códigos HTTP

**2. Services (Lógica de Negocio)**
```typescript
// Ejemplo: services/asientos.service.ts
export class AsientosService {
  async crear(grupoEconomicoId: number, data: CreateAsientoDto) {
    // 1. Validar reglas de negocio
    this.validarPartidaDoble(data.lineas);
    this.validarPeriodoAbierto(data.fecha, grupoEconomicoId);

    // 2. Verificar permisos y existencia de cuentas
    await this.verificarCuentasExisten(data.lineas);

    // 3. Crear asiento con transacción
    return await asientosRepository.crearConLineas(grupoEconomicoId, data);
  }

  private validarPartidaDoble(lineas: LineaAsiento[]) {
    const totalDebe = lineas.reduce((sum, l) => sum + l.debe, 0);
    const totalHaber = lineas.reduce((sum, l) => sum + l.haber, 0);

    if (totalDebe !== totalHaber) {
      throw new ValidationError('El asiento debe estar cuadrado (debe = haber)');
    }
  }
}
```

**Responsabilidades:**
- Implementar reglas de negocio
- Validaciones complejas (partida doble, períodos, permisos)
- Orquestar múltiples repositorios
- Transacciones

**3. Repositories (Acceso a Datos)**
```typescript
// Ejemplo: repositories/asientos.repository.ts
export class AsientosRepository {
  async listar(grupoEconomicoId: number, filters: AsientosFilters) {
    return await prisma.asiento.findMany({
      where: {
        grupoEconomicoId,
        empresaId: filters.empresaId,
        fecha: {
          gte: filters.fechaDesde,
          lte: filters.fechaHasta
        }
      },
      include: {
        lineas: {
          include: {
            cuenta: true
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });
  }

  async crearConLineas(grupoEconomicoId: number, data: CreateAsientoDto) {
    return await prisma.$transaction(async (tx) => {
      const asiento = await tx.asiento.create({
        data: {
          grupoEconomicoId,
          ...data,
          lineas: {
            create: data.lineas
          }
        },
        include: { lineas: true }
      });
      return asiento;
    });
  }
}
```

**Responsabilidades:**
- Queries de Prisma
- Transacciones de base de datos
- Operaciones CRUD específicas
- NO contiene lógica de negocio

#### Flujo de Datos Completo

**Ejemplo: Crear un Asiento Contable**

```
1. Request HTTP
   POST /api/asientos
   Body: { empresaId, fecha, lineas: [...] }
   Headers: { Authorization: "Bearer JWT" }

2. Middleware de Autenticación
   → Verifica JWT con Clerk
   → Extrae userId y grupoEconomicoId
   → Adjunta a request.user

3. Middleware de Validación
   → Valida body con Zod schema
   → Si falla: retorna 400 Bad Request

4. Route Handler (Controller)
   → Llama a asientosService.crear()

5. Service (Lógica de Negocio)
   → Validar partida doble (debe = haber)
   → Validar período contable abierto
   → Verificar que cuentas existen
   → Validar permisos del usuario
   → Si todo OK: llama a repository

6. Repository (Acceso a Datos)
   → Inicia transacción
   → Crea asiento
   → Crea líneas de asiento
   → Commit transacción
   → Retorna asiento creado

7. Service
   → Retorna asiento al controller

8. Route Handler
   → Transforma a JSON response
   → Retorna 201 Created
```

#### Ventajas de esta Arquitectura

✅ **Separación de responsabilidades**: Cada capa tiene un propósito claro

✅ **Testeable**: Puedes testear servicios sin levantar servidor HTTP

✅ **Mantenible**: Cambios en una capa no afectan otras

✅ **Escalable**: Fácil agregar nuevas features

✅ **Reutilizable**: Servicios pueden ser llamados desde diferentes rutas

✅ **Segura**: Validación en múltiples niveles

#### Manejo de Errores

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, 403, 'FORBIDDEN');
  }
}

// middleware/error-handler.ts
export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message
      }
    });
  }

  // Error no esperado - loggear y retornar 500
  logger.error(error);
  return reply.code(500).send({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
};
```

---

## 3. SERVICIOS CLOUD

### 3.1 Frontend: Vercel

**¿Qué es?**
Plataforma de hosting especializada en Next.js y frameworks modernos.

**¿Qué hace por nosotros?**
- Deploy automático desde Git (push → build → live en minutos)
- CDN global (app rápida en todo el mundo)
- HTTPS automático
- Edge Functions (serverless cerca del usuario)
- Preview deployments (cada PR tiene su URL de prueba)

**Características clave:**
- Build time: ~2-3 minutos
- Rollback instantáneo a versión anterior
- Environment variables por ambiente (dev, staging, prod)
- Analytics built-in

**Costo:**
- Hobby: $0 (para proyectos personales)
- Pro: $20/mes (para producción)

**Setup:**
1. Crear cuenta: https://vercel.com/signup
2. Conectar repositorio de GitHub
3. Configurar variables de entorno
4. Deploy automático

**URL:** https://vercel.com

---

### 3.2 Backend: Railway

**¿Qué es?**
Plataforma para deployar aplicaciones backend (Node.js, Python, Go, etc.)

**¿Qué hace por nosotros?**
- Deploy automático desde Git
- Logs en tiempo real
- Métricas (CPU, RAM, requests)
- Variables de entorno
- Escalado automático
- Base de datos PostgreSQL incluida (opcional, usaremos Supabase)

**Características clave:**
- Detecta automáticamente tipo de proyecto (package.json → Node.js)
- Genera Dockerfile si no existe
- Health checks automáticos
- Restart automático si crashea

**Costo:**
- $5/mes base + uso
- ~$10-20/mes para empezar

**Setup:**
1. Crear cuenta: https://railway.app/
2. Conectar repositorio
3. Configurar variables
4. Deploy

**URL:** https://railway.app

---

### 3.3 Base de Datos: Supabase

**¿Qué es?**
PostgreSQL managed + extras (Realtime, Storage, Auth)

**¿Qué hace por nosotros?**
- PostgreSQL 15 listo en 2 minutos
- Backups automáticos diarios
- Dashboard web para ver/editar datos
- Connection pooling (maneja muchas conexiones)
- Row-Level Security (multi-tenancy seguro)
- API REST automática (opcional, no la usaremos)

**Características clave:**
- Sin configuración de redes (solo connection string)
- Studio web (como phpMyAdmin pero mejor)
- Extensions disponibles (pgcrypto, uuid-ossp)
- Logs de queries

**Costo:**
- Free: $0 (500MB, pausa después de 1 semana inactividad)
- Pro: $25/mes (8GB, 50GB bandwidth, sin pausas)

**Setup:**
1. Crear cuenta: https://supabase.com/dashboard
2. New Project → elegir región (cerca de usuarios)
3. Copiar connection string
4. Pegar en .env del backend

**Connection String:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**URL:** https://supabase.com

---

### 3.4 Autenticación: Clerk

**¿Qué es?**
Servicio de autenticación completo (login, signup, MFA, OAuth)

**¿Qué hace por nosotros?**
- UI components pre-hechos (login form, user button)
- OAuth con Google, Microsoft, GitHub
- Multi-Factor Authentication (2FA)
- Organizations (perfecto para grupos económicos)
- Session management
- Webhooks (sincronizar usuarios con nuestra DB)

**Características clave:**
- Integraciones oficiales con Next.js y Node.js
- Customizable (colores, logo)
- User management dashboard
- No guardamos passwords (todo en Clerk)

**Costo:**
- Free: 10,000 usuarios activos/mes
- Pro: $25/mes después

**Setup:**
1. Crear cuenta: https://dashboard.clerk.com/sign-up
2. Create Application
3. Copiar keys (Publishable Key y Secret Key)
4. Instalar SDK:
   ```bash
   # Frontend
   npm install @clerk/nextjs
   
   # Backend
   npm install @clerk/backend
   ```

**Variables de entorno:**
```bash
# Frontend (.env.local)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx

# Backend (.env)
CLERK_SECRET_KEY=sk_test_xxxxx
```

**URL:** https://clerk.com

---

### 3.5 Email: Resend

**¿Qué es?**
Servicio moderno de email transaccional

**¿Qué hace por nosotros?**
- Enviar emails con API simple
- Templates con React (JSX)
- Tracking de opens/clicks
- Excelente deliverability (no van a spam)

**Características clave:**
- 100 líneas de código vs 1000+ con otros servicios
- React para templates (reutilizar componentes)
- Logs de todos los emails
- Testing en desarrollo

**Costo:**
- Free: 3,000 emails/mes
- Pro: $20/mes (50,000 emails)

**Setup:**
1. Crear cuenta: https://resend.com/signup
2. Verify domain (para enviar desde @tuapp.com)
3. Create API Key
4. Instalar SDK:
   ```bash
   npm install resend
   ```

**Código de ejemplo:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'contabilidad@tuapp.com',
  to: 'cliente@empresa.com',
  subject: 'Factura #123',
  react: <FacturaEmail factura={data} />
});
```

**URL:** https://resend.com

---

### 3.6 Storage: Cloudflare R2

**¿Qué es?**
Object storage (como AWS S3) sin costos de egress

**¿Qué hace por nosotros?**
- Almacenar archivos (PDFs, Excel, logos)
- S3-compatible (misma API)
- CDN incluido (Cloudflare)
- $0 para descargar (S3 cobra $0.09/GB)

**Características clave:**
- Perfecto para PDFs de facturas que se descargan mucho
- Dominio personalizado (files.tuapp.com)
- Versionado de archivos
- Lifecycle policies (borrar archivos viejos)

**Costo:**
- Storage: $0.015/GB/mes
- Downloads: $0 (vs $0.09/GB en S3)

**Setup:**
1. Crear cuenta Cloudflare: https://dash.cloudflare.com/sign-up
2. R2 → Create Bucket
3. Create API Token
4. Instalar SDK:
   ```bash
   npm install @aws-sdk/client-s3
   ```

**Código de ejemplo:**
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

await s3.send(new PutObjectCommand({
  Bucket: 'contabilidad',
  Key: 'facturas/2025/factura-123.pdf',
  Body: pdfBuffer
}));
```

**URL:** https://www.cloudflare.com/products/r2/

---

### 3.7 Queue/Cache: Upstash Redis

**¿Qué es?**
Redis serverless (pay-per-use)

**¿Qué hace por nosotros?**
- Queue para tareas asíncronas (envío emails, generar reportes)
- Cache de queries pesadas
- Rate limiting
- Session storage (opcional)

**Características clave:**
- Serverless (pagas por comando, no por hora)
- No need to manage server
- Global replication

**Costo:**
- Free: 10,000 comandos/día
- Pay-as-you-go: $0.2 por 100k comandos

**Setup:**
1. Crear cuenta: https://console.upstash.com/
2. Create Database
3. Copy connection string
4. Instalar SDK:
   ```bash
   npm install bullmq ioredis
   ```

**Código de ejemplo:**
```typescript
import { Queue, Worker } from 'bullmq';

const connection = {
  host: 'xxxxx.upstash.io',
  port: 6379,
  password: 'xxxxx',
  tls: {}
};

// Agregar job a la queue
const queue = new Queue('reports', { connection });
await queue.add('balance', { grupoId: 1, mes: '2025-01' });

// Worker que procesa jobs
const worker = new Worker('reports', async (job) => {
  const report = await generateBalance(job.data);
  await sendEmail(report);
}, { connection });
```

**URL:** https://upstash.com

---

### 3.8 Error Tracking: Sentry

**¿Qué es?**
Monitoreo de errores y performance

**¿Qué hace por nosotros?**
- Captura excepciones automáticamente
- Stack traces completos
- Breadcrumbs (qué hizo usuario antes del error)
- Performance monitoring
- Alertas por email/Slack

**Características clave:**
- Source maps (ve código TypeScript, no compilado)
- Release tracking (asocia errores a versión)
- User feedback (usuario puede reportar bug)

**Costo:**
- Free: 5,000 errores/mes
- Team: $26/mes (50k errores)

**Setup:**
1. Crear cuenta: https://sentry.io/signup/
2. Create Project (Next.js)
3. Instalar SDK:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```
4. Ya funciona (wizard configura todo)

**URL:** https://sentry.io

---

### 3.9 Logs: Axiom

**¿Qué es?**
Logging y analytics moderno

**¿Qué hace por nosotros?**
- Guardar logs estructurados
- Query tipo SQL
- Dashboards
- Alertas

**Características clave:**
- Más moderno que CloudWatch
- Query language potente
- Integración con Next.js y Node.js

**Costo:**
- Free: 500MB/mes
- Pro: $25/mes (30GB)

**Setup:**
1. Crear cuenta: https://app.axiom.co/signup
2. Create Dataset
3. Instalar SDK:
   ```bash
   npm install @axiomhq/js
   ```

**Código de ejemplo:**
```typescript
import { Axiom } from '@axiomhq/js';

const axiom = new Axiom({ token: process.env.AXIOM_TOKEN });

logger.info({ userId: 123, action: 'create_asiento' }, 'Asiento creado');
await axiom.ingest('contabilidad', [
  { timestamp: new Date(), userId: 123, action: 'create_asiento' }
]);
```

**URL:** https://axiom.co

---

### 3.10 Tabla Resumen de Servicios

| Servicio | Propósito | Costo Free | Costo Pro | URL |
|----------|-----------|------------|-----------|-----|
| Vercel | Frontend | $0 | $20/mes | https://vercel.com |
| Railway | Backend | - | $10-20/mes | https://railway.app |
| Supabase | PostgreSQL | $0 | $25/mes | https://supabase.com |
| Clerk | Auth | $0 (10k MAU) | $25/mes | https://clerk.com |
| Resend | Email | $0 (3k) | $20/mes | https://resend.com |
| Cloudflare R2 | Storage | $0 (10GB) | Pay-as-go | https://cloudflare.com/r2 |
| Upstash | Redis | $0 (10k cmd) | Pay-as-go | https://upstash.com |
| Sentry | Errors | $0 (5k) | $26/mes | https://sentry.io |
| Axiom | Logs | $0 (500MB) | $25/mes | https://axiom.co |
| **TOTAL** | - | **$0** | **~$150/mes** | - |

---

## 4. DESARROLLO LOCAL CON DOCKER

### 4.1 Filosofía de Desarrollo

**Principio:** Todo corre en Docker localmente, cero instalaciones en la máquina del desarrollador (excepto Docker Desktop)

**Ventajas:**
- ✅ Setup en 30 minutos (primera vez)
- ✅ Mismo entorno para todos los developers
- ✅ Versiones de Node/PostgreSQL controladas
- ✅ Fácil reset (docker-compose down -v)
- ✅ Aislamiento (no contamina tu máquina)

### 4.2 Arquitectura Docker Local

```
DOCKER COMPOSE orquesta:
├─ Frontend (Next.js en Node 20)
├─ Backend (Fastify en Node 20)
├─ PostgreSQL 15
├─ Redis 7
├─ MinIO (S3-compatible local)
└─ MailHog (Email mock local)
```

### 4.3 docker-compose.yml

```yaml
version: '3.8'

services:
  # ===================================
  # BASE DE DATOS
  # ===================================
  postgres:
    image: postgres:15-alpine
    container_name: contabilidad-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: contabilidad_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - contabilidad-network

  # ===================================
  # BACKEND
  # ===================================
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: contabilidad-backend
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:dev_password@postgres:5432/contabilidad_dev
      PORT: 8000
      CLERK_SECRET_KEY: ${CLERK_SECRET_KEY_DEV}
      RESEND_API_KEY: ${RESEND_API_KEY_DEV}
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY: minioadmin
      S3_SECRET_KEY: minioadmin
      REDIS_URL: redis://redis:6379
      SMTP_HOST: mailhog
      SMTP_PORT: 1025
    ports:
      - "8000:8000"
    volumes:
      - ./backend/src:/app/src:ro
      - ./backend/prisma:/app/prisma:ro
      - backend_node_modules:/app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - contabilidad-network
    command: npm run dev

  # ===================================
  # FRONTEND
  # ===================================
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: contabilidad-frontend
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_API_URL: http://localhost:8000
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${CLERK_PUBLISHABLE_KEY_DEV}
    ports:
      - "3000:3000"
    volumes:
      - ./frontend/src:/app/src:ro
      - ./frontend/public:/app/public:ro
      - ./frontend/next.config.js:/app/next.config.js:ro
      - ./frontend/tailwind.config.js:/app/tailwind.config.js:ro
      - frontend_node_modules:/app/node_modules
      - frontend_nextjs_cache:/app/.next
    depends_on:
      - backend
    networks:
      - contabilidad-network
    command: npm run dev

  # ===================================
  # REDIS (Queue/Cache)
  # ===================================
  redis:
    image: redis:7-alpine
    container_name: contabilidad-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - contabilidad-network

  # ===================================
  # MINIO (S3 local)
  # ===================================
  minio:
    image: minio/minio
    container_name: contabilidad-minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    networks:
      - contabilidad-network

  # ===================================
  # MAILHOG (Email local)
  # ===================================
  mailhog:
    image: mailhog/mailhog
    container_name: contabilidad-mailhog
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI
    networks:
      - contabilidad-network

volumes:
  postgres_data:
  redis_data:
  minio_data:
  backend_node_modules:
  frontend_node_modules:
  frontend_nextjs_cache:

networks:
  contabilidad-network:
    driver: bridge
```

### 4.4 Dockerfile.dev (Backend)

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del sistema para Prisma
RUN apk add --no-cache openssl

# Copiar package files
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci

# Generar Prisma Client
RUN npx prisma generate

# Exponer puerto
EXPOSE 8000

# Hot reload con tsx watch
CMD ["npm", "run", "dev"]
```

### 4.5 Dockerfile.dev (Frontend)

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Exponer puerto
EXPOSE 3000

# Hot reload con Next.js
CMD ["npm", "run", "dev"]
```

### 4.6 Comandos de Uso Diario

**Setup inicial (primera vez):**
```bash
# 1. Clonar repo
git clone https://github.com/tu-org/contabilidad-app.git
cd contabilidad-app

# 2. Copiar variables de entorno
cp .env.example .env
# Editar .env con test keys de Clerk

# 3. Levantar todo
docker-compose up -d

# 4. Ver logs
docker-compose logs -f

# 5. Aplicar migrations
docker-compose exec backend npx prisma migrate dev

# 6. Seed
docker-compose exec backend npm run seed

# 7. Crear bucket en MinIO
# http://localhost:9001 → Create Bucket "contabilidad"
```

**Desarrollo diario:**
```bash
# Levantar
docker-compose up -d

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Editas código en ./frontend/src o ./backend/src
# Hot reload automático

# Detener
docker-compose stop

# Detener y eliminar contenedores (datos persisten)
docker-compose down

# Rebuild (si cambias package.json)
docker-compose up -d --build
```

**Utilidades:**
```bash
# Prisma Studio (GUI para DB)
docker-compose exec backend npx prisma studio
# Abre en http://localhost:5555

# Conectar a PostgreSQL
docker-compose exec postgres psql -U postgres -d contabilidad_dev

# Ver Redis
docker-compose exec redis redis-cli

# Reset completo de DB
docker-compose exec backend npx prisma migrate reset

# Limpiar TODO (cuidado, borra datos)
docker-compose down -v
```

### 4.7 URLs de Desarrollo

Una vez levantado, accede a:

```
Frontend:        http://localhost:3000
Backend API:     http://localhost:8000
Backend Health:  http://localhost:8000/health

PostgreSQL:      localhost:5432
  User: postgres
  Pass: dev_password
  DB: contabilidad_dev

MinIO Console:   http://localhost:9001
  User: minioadmin
  Pass: minioadmin

MailHog UI:      http://localhost:8025

Prisma Studio:   http://localhost:5555
  (después de ejecutar: docker-compose exec backend npx prisma studio)
```

---

## 5. BASE DE DATOS

### 5.1 PostgreSQL - Por qué

**Elegimos PostgreSQL porque:**
- ✅ Open source y gratis
- ✅ Más features que MySQL (JSON, arrays, full-text search)
- ✅ Row-Level Security nativo (perfecto para multi-tenancy)
- ✅ Excelente performance
- ✅ ACID compliant (transacciones seguras)
- ✅ Extensions (uuid, pgcrypto)
- ✅ Comunidad enorme

### 5.2 Prisma ORM

**¿Qué es Prisma?**
ORM (Object-Relational Mapper) moderno para Node.js/TypeScript

**Ventajas sobre SQL crudo:**
- ✅ Type-safe: autocomplete de tablas y columnas
- ✅ Migrations automáticas
- ✅ Prisma Studio (GUI para ver datos)
- ✅ Queries más legibles

**Ejemplo comparativo:**

```typescript
// SQL crudo (sin type-safety)
const result = await db.query(`
  SELECT * FROM empresas 
  WHERE grupo_economico_id = $1
`, [grupoId]);
// result es 'any', no sabes qué campos tiene

// Prisma (type-safe)
const empresas = await prisma.empresa.findMany({
  where: { grupoEconomicoId: grupoId }
});
// empresas es Empresa[], autocomplete funciona
// Si escribes mal 'grupoEconomicoId' → error en editor
```

### 5.3 Schema de Prisma

**Ubicación:** `backend/prisma/schema.prisma`

**Contenido completo:** Ver sección 6 (Modelo de Datos SQL)

### 5.4 Migrations

**¿Qué son?**
Archivos que describen cambios en el schema de la DB

**Workflow:**

```bash
# 1. Editas schema.prisma
model Empresa {
  id     Int    @id @default(autoincrement())
  nombre String
  rut    String @unique  // ← Campo nuevo
}

# 2. Generas migration
npx prisma migrate dev --name agregar_rut

# Prisma:
# - Compara schema actual vs DB
# - Genera SQL migration
# - Aplica cambios a DB local
# - Actualiza Prisma Client

# 3. Commit migration a Git
git add prisma/migrations/
git commit -m "Add rut to empresa"

# 4. En producción, Railway aplica migrations automáticamente
```

**Migrations importantes:**

```bash
# Ver estado de migrations
npx prisma migrate status

# Aplicar migrations pendientes
npx prisma migrate deploy

# Reset completo (dev only)
npx prisma migrate reset
```

### 5.5 Row-Level Security (RLS)

**Concepto:** PostgreSQL filtra automáticamente resultados según usuario

**Setup:**

```sql
-- Habilitar RLS en tablas
ALTER TABLE asientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Policy: Usuario solo ve datos de sus grupos
CREATE POLICY asientos_tenant_isolation ON asientos
  USING (
    grupo_economico_id IN (
      SELECT grupo_economico_id 
      FROM usuarios_grupos 
      WHERE usuario_id = current_setting('app.user_id')::INTEGER
    )
  );

-- Al hacer query desde la app:
-- 1. Backend setea user_id en session:
await prisma.$executeRaw`SET app.user_id = ${userId}`;

-- 2. Cualquier query automáticamente filtra:
const asientos = await prisma.asiento.findMany();
// PostgreSQL solo retorna asientos del grupo del usuario
```

**Ventajas:**
- ✅ Imposible ver datos de otros tenants (aunque haya bug en app)
- ✅ Implementado en DB (última capa de seguridad)
- ✅ Performance (índices optimizados por tenant)

---

## 6. MODELO DE DATOS SQL

### 6.1 Schema Completo de Prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===================================
// GRUPOS ECONÓMICOS (Tenants)
// ===================================
model GrupoEconomico {
  id                   Int       @id @default(autoincrement())
  nombre               String
  rutControlador       String?   @map("rut_controlador")
  paisPrincipal        String    @map("pais_principal") @db.VarChar(2)
  monedaConsolidacion  String    @map("moneda_consolidacion") @db.VarChar(3)
  fechaCreacion        DateTime  @default(now()) @map("fecha_creacion")
  activo               Boolean   @default(true)

  // Relaciones
  empresas             Empresa[]
  planCuentas          PlanCuentas[]
  usuarios             UsuarioGrupo[]
  clientes             Cliente[]
  proveedores          Proveedor[]

  @@map("grupos_economicos")
}

// ===================================
// EMPRESAS
// ===================================
model Empresa {
  id                Int       @id @default(autoincrement())
  grupoEconomicoId  Int       @map("grupo_economico_id")
  nombre            String
  nombreComercial   String?   @map("nombre_comercial")
  rut               String
  pais              String    @db.VarChar(2)
  monedaFuncional   String    @map("moneda_funcional") @db.VarChar(3)
  fechaInicio       DateTime? @map("fecha_inicio") @db.Date
  activa            Boolean   @default(true)

  // Relaciones
  grupoEconomico    GrupoEconomico @relation(fields: [grupoEconomicoId], references: [id])
  asientos          Asiento[]
  usuariosEmpresas  UsuarioEmpresa[]

  @@unique([grupoEconomicoId, rut])
  @@map("empresas")
}

// ===================================
// PLAN DE CUENTAS
// ===================================
model PlanCuentas {
  id                 Int       @id @default(autoincrement())
  grupoEconomicoId   Int       @map("grupo_economico_id")
  codigo             String
  nombre             String
  cuentaPadreId      Int?      @map("cuenta_padre_id")
  tipo               TipoCuenta
  nivel              Int
  imputable          Boolean   @default(true)
  requiereAuxiliar   Boolean   @default(false) @map("requiere_auxiliar")
  tipoAuxiliar       String?   @map("tipo_auxiliar") @db.VarChar(50)
  moneda             Moneda    @default(FUNCIONAL)
  activa             Boolean   @default(true)

  // Relaciones
  grupoEconomico     GrupoEconomico @relation(fields: [grupoEconomicoId], references: [id])
  cuentaPadre        PlanCuentas?   @relation("CuentasPadreHijo", fields: [cuentaPadreId], references: [id])
  subcuentas         PlanCuentas[]  @relation("CuentasPadreHijo")
  lineasAsiento      LineaAsiento[]

  @@unique([grupoEconomicoId, codigo])
  @@map("plan_cuentas")
}

enum TipoCuenta {
  ACTIVO
  PASIVO
  PATRIMONIO
  INGRESO
  EGRESO
}

enum Moneda {
  MN
  USD
  AMBAS
  FUNCIONAL
}

// ===================================
// ASIENTOS CONTABLES
// ===================================
model Asiento {
  id                Int           @id @default(autoincrement())
  grupoEconomicoId  Int           @map("grupo_economico_id")
  empresaId         Int           @map("empresa_id")
  numero            Int
  fecha             DateTime      @db.Date
  descripcion       String        @db.Text
  tipo              TipoAsiento   @default(DIARIO)
  estado            EstadoAsiento @default(BORRADOR)
  creadoPor         Int           @map("creado_por")
  creadoEn          DateTime      @default(now()) @map("creado_en")
  modificadoEn      DateTime?     @updatedAt @map("modificado_en")

  // Relaciones
  empresa           Empresa        @relation(fields: [empresaId], references: [id])
  lineas            LineaAsiento[]
  creadoPorUsuario  Usuario        @relation(fields: [creadoPor], references: [id])

  @@unique([empresaId, numero])
  @@index([fecha])
  @@index([grupoEconomicoId])
  @@map("asientos")
}

enum TipoAsiento {
  DIARIO
  APERTURA
  AJUSTE
  CIERRE
}

enum EstadoAsiento {
  BORRADOR
  CONFIRMADO
}

// ===================================
// LÍNEAS DE ASIENTO
// ===================================
model LineaAsiento {
  id            Int      @id @default(autoincrement())
  asientoId     Int      @map("asiento_id")
  cuentaId      Int      @map("cuenta_id")
  debe          Decimal  @db.Decimal(18, 2)
  haber         Decimal  @db.Decimal(18, 2)
  moneda        String   @db.VarChar(3)
  tipoCambio    Decimal? @map("tipo_cambio") @db.Decimal(10, 4)
  auxiliarTipo  String?  @map("auxiliar_tipo") @db.VarChar(50)
  auxiliarId    Int?     @map("auxiliar_id")
  centroCosto   String?  @map("centro_costo") @db.VarChar(100)
  glosa         String?  @db.Text

  // Relaciones
  asiento       Asiento     @relation(fields: [asientoId], references: [id], onDelete: Cascade)
  cuenta        PlanCuentas @relation(fields: [cuentaId], references: [id])

  @@index([asientoId])
  @@index([cuentaId])
  @@map("lineas_asiento")
}

// ===================================
// USUARIOS
// ===================================
model Usuario {
  id              Int      @id @default(autoincrement())
  email           String   @unique
  nombre          String
  authProviderId  String   @unique @map("auth_provider_id")
  activo          Boolean  @default(true)

  // Relaciones
  grupos          UsuarioGrupo[]
  empresas        UsuarioEmpresa[]
  asientos        Asiento[]

  @@map("usuarios")
}

model UsuarioGrupo {
  usuarioId         Int    @map("usuario_id")
  grupoEconomicoId  Int    @map("grupo_economico_id")
  rol               Rol

  // Relaciones
  usuario           Usuario         @relation(fields: [usuarioId], references: [id])
  grupoEconomico    GrupoEconomico  @relation(fields: [grupoEconomicoId], references: [id])

  @@id([usuarioId, grupoEconomicoId])
  @@map("usuarios_grupos")
}

model UsuarioEmpresa {
  usuarioId      Int     @map("usuario_id")
  empresaId      Int     @map("empresa_id")
  puedeEscribir  Boolean @default(false) @map("puede_escribir")

  // Relaciones
  usuario        Usuario @relation(fields: [usuarioId], references: [id])
  empresa        Empresa @relation(fields: [empresaId], references: [id])

  @@id([usuarioId, empresaId])
  @@map("usuarios_empresas")
}

enum Rol {
  ADMIN
  CONTADOR
  OPERATIVO
  LECTURA
}

// ===================================
// CLIENTES
// ===================================
model Cliente {
  id                Int      @id @default(autoincrement())
  grupoEconomicoId  Int      @map("grupo_economico_id")
  nombre            String
  rut               String?
  email             String?
  telefono          String?
  direccion         String?  @db.Text
  activo            Boolean  @default(true)

  // Relaciones
  grupoEconomico    GrupoEconomico @relation(fields: [grupoEconomicoId], references: [id])

  @@map("clientes")
}

// ===================================
// PROVEEDORES
// ===================================
model Proveedor {
  id                Int      @id @default(autoincrement())
  grupoEconomicoId  Int      @map("grupo_economico_id")
  nombre            String
  rut               String?
  email             String?
  telefono          String?
  direccion         String?  @db.Text
  activo            Boolean  @default(true)

  // Relaciones
  grupoEconomico    GrupoEconomico @relation(fields: [grupoEconomicoId], references: [id])

  @@map("proveedores")
}
```

### 6.2 Índices Importantes

```sql
-- Asientos por fecha (reportes)
CREATE INDEX idx_asientos_fecha ON asientos(fecha);

-- Asientos por grupo (RLS)
CREATE INDEX idx_asientos_grupo ON asientos(grupo_economico_id);

-- Líneas por cuenta (balance)
CREATE INDEX idx_lineas_cuenta ON lineas_asiento(cuenta_id);

-- Plan de cuentas por grupo
CREATE INDEX idx_plan_grupo ON plan_cuentas(grupo_economico_id);
```

### 6.3 Constraints y Validaciones

```sql
-- Línea de asiento: debe O haber (no ambos)
ALTER TABLE lineas_asiento ADD CONSTRAINT check_debe_o_haber
  CHECK (
    (debe > 0 AND haber = 0) OR 
    (debe = 0 AND haber > 0)
  );

-- Línea: debe y haber no negativos
ALTER TABLE lineas_asiento ADD CONSTRAINT check_no_negativos
  CHECK (debe >= 0 AND haber >= 0);

-- Empresa: RUT único por grupo
ALTER TABLE empresas ADD CONSTRAINT unique_rut_por_grupo
  UNIQUE (grupo_economico_id, rut);
```

---

## 7. APIS Y ENDPOINTS

### 7.1 Estructura de la API

**Base URL:**
- Desarrollo: `http://localhost:8000`
- Producción: `https://api.tuapp.com`

**Autenticación:** Bearer token (JWT de Clerk)

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 7.2 Endpoints Principales

#### **Health Check**
```http
GET /health

Response: 200 OK
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00Z",
  "database": "connected"
}
```

#### **Grupos Económicos**
```http
# Listar grupos del usuario
GET /api/grupos
Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "nombre": "Grupo Pragmatic",
      "paisPrincipal": "UY",
      "monedaConsolidacion": "USD"
    }
  ]
}

# Crear grupo
POST /api/grupos
Body: {
  "nombre": "Grupo Nuevo",
  "paisPrincipal": "UY",
  "monedaConsolidacion": "USD"
}
Response: 201 Created
```

#### **Empresas**
```http
# Listar empresas de un grupo
GET /api/grupos/:grupoId/empresas
Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "nombre": "Pragmatic Uruguay SRL",
      "rut": "217654320018",
      "monedaFuncional": "UYU"
    }
  ]
}

# Crear empresa
POST /api/grupos/:grupoId/empresas
Body: {
  "nombre": "Nueva Empresa SA",
  "rut": "123456789012",
  "pais": "UY",
  "monedaFuncional": "UYU"
}
```

#### **Plan de Cuentas**
```http
# Listar plan de cuentas
GET /api/grupos/:grupoId/plan-cuentas
Query params:
  - nivel: 1,2,3,4 (filtrar por nivel)
  - tipo: ACTIVO,PASIVO,INGRESO,EGRESO
  - buscar: "banco" (search)

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "codigo": "1.1.1.010",
      "nombre": "Banco Santander MN",
      "tipo": "ACTIVO",
      "imputable": true
    }
  ]
}

# Crear cuenta
POST /api/grupos/:grupoId/plan-cuentas
Body: {
  "codigo": "1.1.1.030",
  "nombre": "Banco ITAU USD",
  "cuentaPadreId": 5,
  "tipo": "ACTIVO",
  "nivel": 4,
  "imputable": true,
  "moneda": "USD"
}
```

#### **Asientos**
```http
# Listar asientos
GET /api/empresas/:empresaId/asientos
Query params:
  - fechaDesde: 2025-01-01
  - fechaHasta: 2025-01-31
  - estado: BORRADOR,CONFIRMADO
  - page: 1
  - limit: 50

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "numero": 1,
      "fecha": "2025-01-15",
      "descripcion": "Factura #123",
      "tipo": "DIARIO",
      "estado": "CONFIRMADO",
      "lineas": [
        {
          "cuenta": {
            "codigo": "1.1.2.001",
            "nombre": "CxC - Cliente XYZ"
          },
          "debe": 10000,
          "haber": 0
        },
        {
          "cuenta": {
            "codigo": "4.1.1",
            "nombre": "Ingresos por Servicios"
          },
          "debe": 0,
          "haber": 10000
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}

# Crear asiento
POST /api/empresas/:empresaId/asientos
Body: {
  "fecha": "2025-01-15",
  "descripcion": "Factura #123 a Cliente XYZ",
  "tipo": "DIARIO",
  "lineas": [
    {
      "cuentaId": 10,
      "debe": 10000,
      "haber": 0,
      "moneda": "USD",
      "auxiliarTipo": "cliente",
      "auxiliarId": 5
    },
    {
      "cuentaId": 20,
      "debe": 0,
      "haber": 10000,
      "moneda": "USD"
    }
  ]
}

Response: 201 Created
{
  "data": {
    "id": 100,
    "numero": 50,
    "fecha": "2025-01-15",
    ...
  }
}

# Validación automática:
# - Suma debe = suma haber
# - Cuentas imputables
# - Auxiliar si es requerido
# - Errores: 400 Bad Request con detalles
```

#### **Reportes**
```http
# Balance General
GET /api/empresas/:empresaId/reportes/balance
Query params:
  - fecha: 2025-12-31 (fecha del balance)
  - moneda: USD (opcional, default: moneda funcional)

Response: 200 OK
{
  "data": {
    "fecha": "2025-12-31",
    "moneda": "USD",
    "activo": {
      "corriente": {
        "disponibilidades": 35000,
        "cuentasPorCobrar": 23000,
        "total": 58000
      },
      "noCorriente": 0,
      "total": 58000
    },
    "pasivo": {
      "corriente": {
        "cuentasPorPagar": 5000,
        "ivaPorPagar": 2000,
        "total": 7000
      },
      "noCorriente": 0,
      "total": 7000
    },
    "patrimonio": {
      "capital": 30000,
      "resultadosAcumulados": 10000,
      "resultadoEjercicio": 11000,
      "total": 51000
    },
    "balance": true // activo == pasivo + patrimonio
  }
}

# Estado de Resultados
GET /api/empresas/:empresaId/reportes/pyg
Query params:
  - fechaDesde: 2025-01-01
  - fechaHasta: 2025-12-31
  - moneda: USD

Response: 200 OK
{
  "data": {
    "periodo": "2025-01-01 al 2025-12-31",
    "moneda": "USD",
    "ingresos": {
      "servicios": 150000,
      "otros": 5000,
      "total": 155000
    },
    "egresos": {
      "sueldos": 80000,
      "honorarios": 30000,
      "gastos": 20000,
      "total": 130000
    },
    "resultado": 25000
  }
}

# Libro Diario
GET /api/empresas/:empresaId/reportes/libro-diario
Query params:
  - fechaDesde: 2025-01-01
  - fechaHasta: 2025-01-31
  - formato: json|csv|pdf

# Libro Mayor (por cuenta)
GET /api/empresas/:empresaId/reportes/libro-mayor/:cuentaId
Query params:
  - fechaDesde
  - fechaHasta

# Cuentas por Cobrar
GET /api/empresas/:empresaId/reportes/cxc
Response: Lista de facturas pendientes con aging

# Cuentas por Pagar
GET /api/empresas/:empresaId/reportes/cxp
```

### 7.3 Códigos de Error

```
200 OK              - Éxito
201 Created         - Recurso creado
400 Bad Request     - Validación fallida, datos incorrectos
401 Unauthorized    - No autenticado
403 Forbidden       - No tiene permisos
404 Not Found       - Recurso no existe
409 Conflict        - Conflicto (ej: número de asiento duplicado)
422 Unprocessable   - Lógica de negocio fallida (ej: asiento no balancea)
500 Internal Error  - Error del servidor
```

**Formato de error:**
```json
{
  "error": {
    "code": "ASIENTO_NO_BALANCEA",
    "message": "El asiento no balancea. Debe: 10000, Haber: 8000",
    "details": {
      "sumaDebe": 10000,
      "sumaHaber": 8000,
      "diferencia": 2000
    }
  }
}
```

---

## 8. AUTENTICACIÓN Y SEGURIDAD

### 8.1 Flujo de Autenticación

```
1. Usuario abre app → Redirigido a Clerk
2. Usuario hace login (email/password o OAuth)
3. Clerk genera JWT (session token)
4. Frontend guarda token en cookie (httpOnly, secure)
5. Cada request a backend incluye token:
   Authorization: Bearer <token>
6. Backend verifica token con Clerk
7. Si válido: identifica usuario y grupo económico
8. Si inválido: 401 Unauthorized
```

### 8.2 Implementación en Frontend

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}

// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  // Usuario autenticado, cargar datos
  const grupos = await fetch('/api/grupos', {
    headers: {
      Authorization: `Bearer ${await getToken()}`
    }
  });
  
  return <Dashboard grupos={grupos} />;
}
```

### 8.3 Implementación en Backend

```typescript
// backend/src/middleware/auth.ts
import { clerkClient } from '@clerk/backend';
import type { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticateUser(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const token = request.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return reply.status(401).send({ error: 'No token provided' });
  }
  
  try {
    // Verificar token con Clerk
    const session = await clerkClient.verifyToken(token);
    
    // Buscar usuario en nuestra DB
    const user = await prisma.usuario.findUnique({
      where: { authProviderId: session.sub }
    });
    
    if (!user) {
      return reply.status(401).send({ error: 'User not found' });
    }
    
    // Adjuntar usuario al request
    request.user = user;
    
  } catch (error) {
    return reply.status(401).send({ error: 'Invalid token' });
  }
}

// Uso en routes
fastify.get('/api/grupos', {
  preHandler: [authenticateUser]
}, async (request, reply) => {
  const userId = request.user.id;
  
  const grupos = await prisma.grupoEconomico.findMany({
    where: {
      usuarios: {
        some: { usuarioId: userId }
      }
    }
  });
  
  return { data: grupos };
});
```

### 8.4 Permisos y Autorización

```typescript
// Middleware para verificar acceso a grupo
export async function authorizeGrupo(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const grupoId = parseInt(request.params.grupoId);
  
  const acceso = await prisma.usuarioGrupo.findUnique({
    where: {
      usuarioId_grupoEconomicoId: {
        usuarioId,
        grupoEconomicoId: grupoId
      }
    }
  });
  
  if (!acceso) {
    return reply.status(403).send({ 
      error: 'No tienes acceso a este grupo' 
    });
  }
  
  request.userRole = acceso.rol;
}

// Middleware para verificar si puede escribir
export async function requireWriteAccess(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (request.userRole === 'LECTURA') {
    return reply.status(403).send({ 
      error: 'No tienes permisos de escritura' 
    });
  }
}

// Uso
fastify.post('/api/grupos/:grupoId/asientos', {
  preHandler: [authenticateUser, authorizeGrupo, requireWriteAccess]
}, async (request, reply) => {
  // Usuario tiene permisos, proceder
});
```

### 8.5 Seguridad de Datos

**Variables de entorno sensibles:**
```bash
# NUNCA commitear al repo
# Usar .env (local) y variables de entorno en servicios cloud

# Backend
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_live_xxxxx
RESEND_API_KEY=re_xxxxx
R2_SECRET_ACCESS_KEY=xxxxx

# Frontend
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
# (NEXT_PUBLIC_ son públicas, las demás privadas)
```

**HTTPS obligatorio:**
- Desarrollo local: HTTP ok
- Producción: HTTPS siempre (Vercel y Railway lo dan gratis)

**Rate Limiting:**
```typescript
// Prevenir abuso de API
import rateLimit from '@fastify/rate-limit';

fastify.register(rateLimit, {
  max: 100,           // 100 requests
  timeWindow: '1 minute'
});
```

**SQL Injection:**
- ✅ Prisma previene automáticamente (usa prepared statements)
- ❌ Nunca hacer: `prisma.$executeRaw`SELECT * FROM users WHERE id = ${userId}``
- ✅ Siempre: `prisma.user.findUnique({ where: { id: userId } })`

---

## 9. DEPLOYMENT

### 9.1 Environments

```
Development  → Local (Docker)
Staging      → Vercel + Railway (auto-deploy desde main)
Production   → Vercel + Railway (manual/auto desde production branch)
```

### 9.2 Proceso de Deploy

**Frontend (Vercel):**

```bash
# 1. Conectar repo en Vercel dashboard
# 2. Configurar variables de entorno por environment
# 3. Push a Git → deploy automático

# Production:
git checkout production
git merge main
git push origin production
# Vercel detecta push → build → deploy
# URL: https://tuapp.com

# Staging:
git push origin main
# Deploy automático a: https://staging.tuapp.com

# Preview (cada PR):
# URL automática: https://pr-123-tuapp.vercel.app
```

**Backend (Railway):**

```bash
# 1. Conectar repo en Railway dashboard
# 2. Configurar variables de entorno
# 3. Railway detecta cambios → build → deploy

# Variables importantes:
DATABASE_URL=postgresql://...supabase...
NODE_ENV=production
PORT=8000
CLERK_SECRET_KEY=sk_live_xxxxx
```

**Migrations en producción:**

```bash
# Railway corre automáticamente:
npx prisma migrate deploy

# En package.json:
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "deploy": "prisma migrate deploy && npm start"
  }
}

# Railway Config:
# Start Command: npm run deploy
```

### 9.3 Rollback

**Vercel:**
- Dashboard → Deployments → "Promote to Production" en versión anterior
- Instantáneo

**Railway:**
- Dashboard → Deployments → Click en deployment anterior → "Redeploy"
- ~2 minutos

### 9.4 Variables de Entorno por Environment

**Development (.env.local):**
```bash
DATABASE_URL=postgresql://postgres:dev_password@localhost:5432/contabilidad_dev
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
SMTP_HOST=mailhog
S3_ENDPOINT=http://minio:9000
```

**Staging (Vercel/Railway dashboard):**
```bash
DATABASE_URL=postgresql://...supabase.co/postgres  # DB de staging
CLERK_SECRET_KEY=sk_test_xxxxx                     # Test keys
NEXT_PUBLIC_API_URL=https://api-staging.tuapp.com
```

**Production (Vercel/Railway dashboard):**
```bash
DATABASE_URL=postgresql://...supabase.co/postgres  # DB de producción
CLERK_SECRET_KEY=sk_live_xxxxx                     # Live keys
NEXT_PUBLIC_API_URL=https://api.tuapp.com
```

---

## 10. MONITOREO Y LOGS

### 10.1 Sentry (Errores)

**Setup automático:**
```bash
# Frontend y backend
npx @sentry/wizard@latest -i nextjs
```

**Qué captura:**
- Excepciones no manejadas
- Errores de API
- Errores de rendering
- Performance issues

**Dashboard:**
- https://sentry.io/organizations/tu-org/issues/
- Alertas por email/Slack cuando hay errores nuevos

### 10.2 Axiom (Logs)

**Logging estructurado:**
```typescript
import { Logger } from '@axiomhq/js';

const logger = new Logger({
  dataset: 'contabilidad',
  token: process.env.AXIOM_TOKEN
});

// Log con contexto
logger.info('Asiento creado', {
  userId: 123,
  empresaId: 5,
  asientoId: 100,
  monto: 10000
});

// Buscar en Axiom:
// userId == 123 AND action == "create_asiento"
```

### 10.3 Health Checks

```typescript
// backend/src/routes/health.ts
fastify.get('/health', async () => {
  // Verificar DB
  await prisma.$queryRaw`SELECT 1`;
  
  // Verificar Redis
  await redis.ping();
  
  return {
    status: 'ok',
    timestamp: new Date(),
    database: 'connected',
    redis: 'connected'
  };
});

// Railway hace health checks automáticos cada 30s
// Si falla 3 veces → restart automático
```

### 10.4 Métricas

**Railway Dashboard:**
- CPU usage
- Memory usage
- Request count
- Response time (p50, p95, p99)

**Vercel Dashboard:**
- Page views
- Bandwidth
- Build time
- Edge requests

---

## 11. ANEXOS

### 11.1 Scripts Útiles

**package.json (raíz del proyecto):**
```json
{
  "scripts": {
    "dev": "docker-compose up",
    "dev:detach": "docker-compose up -d",
    "stop": "docker-compose stop",
    "down": "docker-compose down",
    "logs": "docker-compose logs -f",
    "logs:backend": "docker-compose logs -f backend",
    "logs:frontend": "docker-compose logs -f frontend",
    "rebuild": "docker-compose up -d --build",
    "db:migrate": "docker-compose exec backend npx prisma migrate dev",
    "db:studio": "docker-compose exec backend npx prisma studio",
    "db:seed": "docker-compose exec backend npm run seed",
    "db:reset": "docker-compose exec backend npx prisma migrate reset",
    "test": "docker-compose exec backend npm test",
    "test:frontend": "docker-compose exec frontend npm test",
    "clean": "docker-compose down -v",
    "setup": "cp .env.example .env && docker-compose up -d && docker-compose exec backend npx prisma migrate dev && docker-compose exec backend npm run seed"
  }
}
```

### 11.2 Checklist de Setup (Primera Vez)

```
□ Instalar Docker Desktop
  https://www.docker.com/products/docker-desktop/

□ Clonar repositorio
  git clone https://github.com/tu-org/contabilidad-app.git

□ Crear cuentas en servicios:
  □ Clerk (auth): https://clerk.com
  □ Resend (email): https://resend.com  
  □ Cloudflare (R2): https://dash.cloudflare.com
  □ Supabase (DB): https://supabase.com
  □ Upstash (Redis): https://upstash.com
  □ Sentry (errors): https://sentry.io
  □ Vercel (frontend): https://vercel.com
  □ Railway (backend): https://railway.app

□ Configurar .env local
  cp .env.example .env
  # Agregar test keys de Clerk

□ Levantar Docker
  docker-compose up -d

□ Aplicar migrations
  docker-compose exec backend npx prisma migrate dev

□ Seed datos de prueba
  docker-compose exec backend npm run seed

□ Crear bucket en MinIO
  http://localhost:9001 (user: minioadmin / minioadmin)
  Create Bucket → "contabilidad"

□ Verificar que todo funciona:
  Frontend:  http://localhost:3000
  Backend:   http://localhost:8000/health
  MailHog:   http://localhost:8025
  MinIO:     http://localhost:9001

□ ¡Empezar a desarrollar! 🚀
```

### 11.3 Troubleshooting

**Docker no inicia:**
```bash
# Ver logs de error
docker-compose logs

# Limpiar y reiniciar
docker-compose down -v
docker-compose up -d --build
```

**PostgreSQL no conecta:**
```bash
# Verificar que contenedor está corriendo
docker-compose ps

# Ver logs de postgres
docker-compose logs postgres

# Probar conexión
docker-compose exec postgres psql -U postgres -d contabilidad_dev
```

**Frontend no se actualiza (hot reload):**
```bash
# Rebuild del contenedor
docker-compose up -d --build frontend

# O reiniciar
docker-compose restart frontend
```

**Prisma migrations fallan:**
```bash
# Reset completo (cuidado, borra datos)
docker-compose exec backend npx prisma migrate reset

# O aplicar migrations manualmente
docker-compose exec backend npx prisma migrate deploy
```

---

**Fin de la Documentación Técnica**

> Este documento contiene toda la información técnica necesaria para desarrollar, deployar y mantener el sistema de contabilidad.

---

**Contacto y Recursos:**
- Documentación Prisma: https://www.prisma.io/docs
- Documentación Next.js: https://nextjs.org/docs
- Documentación Fastify: https://fastify.dev/docs
- Documentación Clerk: https://clerk.com/docs
- Discord/Slack del equipo: [agregar link]
