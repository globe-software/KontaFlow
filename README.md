# KontaFlow - Sistema de Contabilidad Profesional

Sistema de contabilidad basado en **partida doble**, 100% cloud, multi-empresa y multi-moneda.

## 🚀 Características

- ✅ **Partida Doble**: Sistema contable completo y profesional
- ✅ **Multi-empresa**: Gestiona grupos económicos con múltiples empresas
- ✅ **Multi-moneda**: Soporte nativo para UYU, USD, COP y más
- ✅ **Plan de Cuentas Flexible**: Configurable por grupo económico
- ✅ **Automatización**: Cálculos automáticos de IVA, IRAE, diferencias de cambio
- ✅ **100% Cloud**: Deploy en Vercel + Railway + Supabase

## 📋 Stack Tecnológico

### Frontend
- Next.js 14
- React 18
- TypeScript
- TailwindCSS + shadcn/ui
- Clerk (autenticación)

### Backend
- Node.js 20
- Fastify
- Prisma ORM
- PostgreSQL 15
- TypeScript

### Infraestructura Cloud
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Supabase (PostgreSQL)
- **Auth**: Clerk
- **Email**: Resend
- **Storage**: Cloudflare R2
- **Queue/Cache**: Upstash Redis

## 🐳 Desarrollo Local con Docker

Todo el entorno de desarrollo corre en Docker. Solo necesitas tener instalado **Docker Desktop**.

### Servicios Incluidos

- **PostgreSQL 15**: Base de datos
- **Redis 7**: Cache y queue
- **MinIO**: Storage S3-compatible local
- **MailHog**: Testing de emails
- **Backend**: API con hot reload
- **Frontend**: Next.js con hot reload

## 🔧 Setup Inicial (Primera Vez)

### 1. Requisitos Previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Git

### 2. Clonar Repositorio

```bash
git clone https://github.com/globe-software/KontaFlow.git
cd KontaFlow
```

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env y agregar tus keys de Clerk (opcional para desarrollo básico)
# Por ahora, los valores placeholder funcionarán
```

### 4. Levantar Docker Compose

```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f
```

**Tiempo estimado**: ~5-10 minutos la primera vez (descarga imágenes e instala dependencias)

### 5. Aplicar Migraciones de Base de Datos

```bash
# Aplicar migraciones de Prisma
docker-compose exec backend npx prisma migrate dev --name init

# Generar Prisma Client
docker-compose exec backend npx prisma generate
```

### 6. (Opcional) Seed de Datos de Prueba

```bash
# Cargar datos de ejemplo
docker-compose exec backend npm run prisma:seed
```

### 7. Crear Bucket en MinIO

1. Abrir http://localhost:9001
2. Login: `minioadmin` / `minioadmin`
3. Create Bucket → Nombre: `kontaflow`

### 8. Verificar que Todo Funciona

Abre tu navegador en:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Backend Health**: http://localhost:8000/health
- **MinIO Console**: http://localhost:9001
- **MailHog UI**: http://localhost:8025

**PostgreSQL** (usando tu cliente favorito):
- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `dev_password`
- Database: `kontaflow_dev`

## 🎯 Comandos Útiles

### Desarrollo Diario

```bash
# Levantar todo
docker-compose up -d

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Detener
docker-compose stop

# Detener y eliminar contenedores (datos persisten)
docker-compose down
```

### Base de Datos

```bash
# Prisma Studio (GUI para ver/editar datos)
docker-compose exec backend npx prisma studio
# Abre en http://localhost:5555

# Crear nueva migración
docker-compose exec backend npx prisma migrate dev --name nombre_migracion

# Resetear DB completo (CUIDADO: borra todos los datos)
docker-compose exec backend npx prisma migrate reset

# Conectar a PostgreSQL via CLI
docker-compose exec postgres psql -U postgres -d kontaflow_dev
```

### Docker

```bash
# Rebuild (si cambias package.json o Dockerfile)
docker-compose up -d --build

# Ver logs de un servicio específico
docker-compose logs -f [servicio]
# Ejemplos: backend, frontend, postgres, redis

# Ver estado de contenedores
docker-compose ps

# Limpiar TODO (contenedores + volúmenes)
docker-compose down -v
```

## 📁 Estructura del Proyecto

```
kontaflow/
├── backend/                    # API Backend (Fastify + Prisma)
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── routes/            # Endpoints de la API
│   │   ├── middleware/        # Auth, validación, etc.
│   │   ├── lib/               # Utilidades (prisma, etc.)
│   │   └── types/             # TypeScript types
│   ├── prisma/
│   │   ├── schema.prisma      # Modelo de datos
│   │   └── migrations/        # Migraciones SQL
│   ├── Dockerfile.dev
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Frontend (Next.js 14)
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── src/
│   │   ├── components/        # React components
│   │   └── lib/               # Utilidades
│   ├── public/                # Assets estáticos
│   ├── Dockerfile.dev
│   ├── package.json
│   └── next.config.js
│
├── docker-compose.yml          # Orquestación de servicios
├── .env.example                # Template de variables
├── .gitignore
└── README.md
```

## 🗄️ Modelo de Datos

El sistema utiliza **Prisma ORM** con PostgreSQL. Ver `backend/prisma/schema.prisma` para el modelo completo.

### Entidades Principales

- **GrupoEconomico**: Tenant (multi-empresa)
- **Empresa**: Empresas dentro del grupo
- **PlanCuentas**: Plan de cuentas contable
- **Asiento**: Asientos contables (cabezal)
- **LineaAsiento**: Líneas de asiento (debe/haber)
- **Usuario**: Usuarios del sistema
- **Cliente/Proveedor**: Auxiliares

## 🔐 Autenticación

El sistema usa **Clerk** para autenticación. Para desarrollo:

1. Crear cuenta en [Clerk](https://clerk.com)
2. Crear nueva aplicación
3. Copiar keys a `.env`:
   - `CLERK_SECRET_KEY_DEV`
   - `CLERK_PUBLISHABLE_KEY_DEV`

Para desarrollo básico, las keys placeholder funcionan (sin autenticación real).

## 🧪 Testing

```bash
# Tests unitarios
docker-compose exec backend npm test

# Tests con UI
docker-compose exec backend npm run test:ui
```

## 📚 Documentación

- **[Diseño Funcional](./01-DISEÑO-FUNCIONAL.md)**: Especificación completa del sistema
- **[Documentación Técnica](./02-DOCUMENTACIÓN-TÉCNICA.md)**: Stack, arquitectura, deployment
- **[Análisis Excel](./analisis_contabilidad_pragmatic.md)**: Análisis del sistema anterior

## 🚢 Deploy a Producción

Ver documentación técnica completa en `02-DOCUMENTACIÓN-TÉCNICA.md`.

### Resumen

1. **Frontend**: Push a GitHub → Deploy automático en Vercel
2. **Backend**: Push a GitHub → Deploy automático en Railway
3. **Database**: Crear proyecto en Supabase

## 🐛 Troubleshooting

### Docker no inicia

```bash
# Ver logs de error
docker-compose logs

# Limpiar y reiniciar
docker-compose down -v
docker-compose up -d --build
```

### PostgreSQL no conecta

```bash
# Verificar que el contenedor está corriendo
docker-compose ps

# Ver logs de postgres
docker-compose logs postgres

# Probar conexión
docker-compose exec postgres psql -U postgres -d kontaflow_dev
```

### Frontend no actualiza (hot reload)

```bash
# Rebuild del contenedor
docker-compose up -d --build frontend

# O reiniciar
docker-compose restart frontend
```

### Prisma migrations fallan

```bash
# Reset completo (CUIDADO: borra datos)
docker-compose exec backend npx prisma migrate reset

# O aplicar migrations manualmente
docker-compose exec backend npx prisma migrate deploy
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

MIT

## 👥 Equipo

Desarrollado por el equipo de Pragmatic.

---

**¿Necesitas ayuda?** Abre un issue en GitHub o contacta al equipo.
