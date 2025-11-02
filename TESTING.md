# 🧪 Testing KontaFlow API - Grupos Económicos

## 📦 Colección de Postman

**Ubicación**: `/postman/KontaFlow_Grupos.postman_collection.json`

### Cómo importar en Postman:

1. Abrir Postman
2. Click en "Import" (arriba a la izquierda)
3. Seleccionar el archivo `KontaFlow_Grupos.postman_collection.json`
4. La colección aparecerá con el nombre "KontaFlow - Grupos Económicos"

### Variables configuradas:

- `base_url`: `http://localhost:8000`
- `user_id`: `1` (Usuario admin del seed)
- `grupo_id`: `1` (Grupo del seed)

Puedes cambiar estas variables en: Settings → Variables

---

## 🔧 Testing Rápido desde Terminal (curl)

### 1. Health Check
```bash
curl http://localhost:8000/health | jq
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-02T21:23:25.084Z",
  "database": "connected",
  "environment": "development"
}
```

---

### 2. Listar mis grupos
```bash
curl -H "x-user-id: 1" http://localhost:8000/api/grupos/mis-grupos | jq
```

**Respuesta esperada:**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Pragmatic Software Group",
      "paisPrincipal": "UY",
      "monedaBase": "UYU",
      "activo": true
    }
  ]
}
```

---

### 3. Obtener un grupo específico
```bash
curl -H "x-user-id: 1" http://localhost:8000/api/grupos/1 | jq
```

**Respuesta esperada:** Objeto completo con empresas, plan de cuentas y configuración

---

### 4. Crear un nuevo grupo
```bash
curl -X POST http://localhost:8000/api/grupos \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{
    "nombre": "Mi Nuevo Grupo",
    "paisPrincipal": "UY",
    "monedaBase": "USD"
  }' | jq
```

**Respuesta esperada (201 Created):**
```json
{
  "data": {
    "id": 2,
    "nombre": "Mi Nuevo Grupo",
    "rutControlador": null,
    "paisPrincipal": "UY",
    "monedaBase": "USD",
    "fechaCreacion": "2025-11-02T21:24:14.752Z",
    "activo": true,
    "empresas": [],
    "planDeCuentas": {
      "id": 2,
      "nombre": "Plan de cuentas - Mi Nuevo Grupo",
      ...
    },
    "configuracion": {
      "id": 2,
      ...
    }
  },
  "message": "Grupo económico creado correctamente"
}
```

**NOTA**: Observa que automáticamente se crean:
- ✅ Plan de Cuentas vacío
- ✅ Configuración Contable por defecto
- ✅ Usuario asignado como ADMIN del grupo

---

### 5. Actualizar un grupo
```bash
curl -X PUT http://localhost:8000/api/grupos/2 \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{
    "nombre": "Grupo Actualizado",
    "monedaBase": "UYU"
  }' | jq
```

---

### 6. Listar con filtros y paginación
```bash
# Filtrar por país
curl -H "x-user-id: 1" \
  "http://localhost:8000/api/grupos?paisPrincipal=UY&page=1&limit=10" | jq

# Buscar por nombre
curl -H "x-user-id: 1" \
  "http://localhost:8000/api/grupos?search=Pragmatic" | jq

# Solo activos
curl -H "x-user-id: 1" \
  "http://localhost:8000/api/grupos?activo=true" | jq
```

---

### 7. Eliminar un grupo (soft delete)
```bash
curl -X DELETE http://localhost:8000/api/grupos/2 \
  -H "x-user-id: 1" | jq
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Grupo económico eliminado correctamente"
}
```

---

## 🚨 Testing de Errores

### Error 401 - Sin autenticación
```bash
curl http://localhost:8000/api/grupos/mis-grupos | jq
```

**Respuesta:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No se proporcionó autenticación"
  }
}
```

---

### Error 400 - Validación (nombre muy corto)
```bash
curl -X POST http://localhost:8000/api/grupos \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{
    "nombre": "AB",
    "paisPrincipal": "UY",
    "monedaBase": "UYU"
  }' | jq
```

**Respuesta:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Error de validación en los datos enviados",
    "details": {
      "nombre": ["El nombre debe tener al menos 3 caracteres"]
    }
  }
}
```

---

### Error 404 - Grupo no encontrado
```bash
curl -H "x-user-id: 1" http://localhost:8000/api/grupos/999 | jq
```

**Respuesta:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Grupo Económico con id 999 no encontrado"
  }
}
```

---

### Error 422 - Regla de negocio
```bash
# Intentar eliminar un grupo con empresas activas
curl -X DELETE http://localhost:8000/api/grupos/1 \
  -H "x-user-id: 1" | jq
```

**Respuesta:**
```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "No se puede eliminar un grupo con empresas activas. Desactiva las empresas primero.",
    "rule": "EMPRESAS_ACTIVAS"
  }
}
```

---

## 🎯 Casos de Prueba Sugeridos

### ✅ Happy Path
1. Health check funciona
2. Puedo listar mis grupos
3. Puedo crear un grupo nuevo (solo campos requeridos)
4. Puedo crear un grupo con RUT controlador
5. Puedo obtener un grupo por ID
6. Puedo actualizar un grupo
7. Puedo listar con paginación
8. Puedo filtrar por país
9. Puedo buscar por nombre

### ❌ Error Cases
1. Sin autenticación → 401
2. Usuario inexistente → 401
3. Nombre muy corto → 400
4. País inválido → 400
5. Moneda inválida → 400
6. RUT formato incorrecto → 400
7. Grupo no encontrado → 404
8. Eliminar grupo con empresas activas → 422

---

## 📊 Datos de Prueba (Seed)

El sistema viene con datos de prueba:

**Usuarios:**
- ID: 1 - admin@pragmatic.com.uy (ADMIN)
- ID: 2 - contador@pragmatic.com.uy (CONTADOR)
- ID: 3 - operaciones@pragmatic.com.uy (OPERATIVO)

**Grupos:**
- ID: 1 - "Pragmatic Software Group" (UY, UYU)

**Empresas del grupo 1:**
- ID: 1 - "Pragmatic Software S.A." (UY, UYU)
- ID: 2 - "Pragmatic Labs LLC" (US, USD)

---

## 🌐 Testing desde Frontend (Próximamente)

Una vez implementado el frontend, podrás:
1. Navegar a http://localhost:3000
2. Login con Clerk (desarrollo)
3. Ver dashboard con lista de grupos
4. Crear/Editar/Eliminar grupos desde UI

---

## 💡 Tips de Testing

1. **Usar jq para formato**: Agrega `| jq` al final de los curl para JSON formateado
2. **Variables de entorno**:
   ```bash
   export BASE_URL=http://localhost:8000
   export USER_ID=1
   curl -H "x-user-id: $USER_ID" $BASE_URL/api/grupos/mis-grupos | jq
   ```
3. **Postman Environment**: Crea un environment en Postman con las variables para cambiar fácilmente entre desarrollo/staging
4. **Ver logs del backend**: `docker-compose logs -f backend`

---

## 🔍 Ver Datos en la Base de Datos

**DBeaver / Cliente PostgreSQL:**
```
Host:     localhost
Port:     5432
Database: kontaflow_dev
User:     postgres
Password: dev_password
```

**Queries útiles:**
```sql
-- Ver todos los grupos
SELECT * FROM grupos_economicos;

-- Ver plan de cuentas de un grupo
SELECT * FROM planes_de_cuentas WHERE grupo_economico_id = 1;

-- Ver usuarios con acceso a grupos
SELECT u.nombre, g.nombre as grupo, ug.rol
FROM usuarios u
JOIN usuarios_grupos ug ON u.id = ug.usuario_id
JOIN grupos_economicos g ON ug.grupo_economico_id = g.id;
```

---

## ✅ Checklist de Testing Completo

- [ ] Health check funciona
- [ ] Listar mis grupos
- [ ] Crear grupo con campos mínimos
- [ ] Crear grupo con todos los campos
- [ ] Obtener grupo por ID
- [ ] Actualizar nombre
- [ ] Actualizar moneda base
- [ ] Listar con paginación
- [ ] Filtrar por país
- [ ] Buscar por texto
- [ ] Eliminar grupo vacío
- [ ] Error: sin autenticación
- [ ] Error: validación nombre corto
- [ ] Error: país inválido
- [ ] Error: grupo no existe
- [ ] Error: eliminar con empresas activas
- [ ] Verificar en DB: grupo creado correctamente
- [ ] Verificar en DB: plan de cuentas creado
- [ ] Verificar en DB: configuración creada
- [ ] Verificar en DB: usuario asignado como ADMIN
