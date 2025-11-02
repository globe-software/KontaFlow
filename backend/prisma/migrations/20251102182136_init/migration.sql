-- CreateEnum
CREATE TYPE "TipoCuenta" AS ENUM ('ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'EGRESO');

-- CreateEnum
CREATE TYPE "Moneda" AS ENUM ('MN', 'USD', 'AMBAS', 'FUNCIONAL');

-- CreateEnum
CREATE TYPE "TipoAuxiliar" AS ENUM ('CLIENTE', 'PROVEEDOR', 'EMPLEADO', 'OTRO');

-- CreateEnum
CREATE TYPE "NaturalezaCuenta" AS ENUM ('CORRIENTE', 'NO_CORRIENTE');

-- CreateEnum
CREATE TYPE "CategoriaNIIF" AS ENUM ('EFECTIVO_Y_EQUIVALENTES', 'CUENTAS_POR_COBRAR', 'INVENTARIOS', 'PROPIEDAD_PLANTA_EQUIPO', 'ACTIVOS_INTANGIBLES', 'ACTIVOS_FINANCIEROS', 'ACTIVOS_POR_IMPUESTOS_DIFERIDOS', 'CUENTAS_POR_PAGAR', 'PRESTAMOS_Y_FINANCIAMIENTO', 'PROVISIONES', 'PASIVOS_POR_IMPUESTOS_DIFERIDOS', 'CAPITAL_SOCIAL', 'RESERVAS', 'RESULTADOS_ACUMULADOS', 'INGRESOS_OPERACIONALES', 'COSTOS_VENTAS', 'GASTOS_ADMINISTRACION', 'GASTOS_VENTAS', 'GASTOS_FINANCIEROS', 'INGRESOS_FINANCIEROS', 'OTROS_INGRESOS', 'OTROS_GASTOS');

-- CreateEnum
CREATE TYPE "MetodoValuacion" AS ENUM ('COSTO_HISTORICO', 'VALOR_RAZONABLE', 'COSTO_AMORTIZADO', 'VALOR_NETO_REALIZABLE');

-- CreateEnum
CREATE TYPE "TipoPeriodo" AS ENUM ('EJERCICIO', 'MES');

-- CreateEnum
CREATE TYPE "TipoAsiento" AS ENUM ('DIARIO', 'APERTURA', 'AJUSTE', 'CIERRE', 'AJUSTE_CAMBIO', 'DEPRECIACION');

-- CreateEnum
CREATE TYPE "EstadoAsiento" AS ENUM ('BORRADOR', 'PENDIENTE_APROBACION', 'CONFIRMADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "TipoObligacion" AS ENUM ('PAGAR', 'COBRAR');

-- CreateEnum
CREATE TYPE "EstadoObligacion" AS ENUM ('ACTIVA', 'PAGADA', 'CANCELADA', 'VENCIDA');

-- CreateEnum
CREATE TYPE "EstadoCuota" AS ENUM ('PENDIENTE', 'PAGADA_PARCIAL', 'PAGADA', 'VENCIDA');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'CONTADOR', 'OPERATIVO', 'LECTURA');

-- CreateTable
CREATE TABLE "grupos_economicos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "rut_controlador" TEXT,
    "pais_principal" VARCHAR(2) NOT NULL,
    "moneda_base" VARCHAR(3) NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "grupos_economicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" SERIAL NOT NULL,
    "grupo_economico_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombre_comercial" TEXT,
    "rut" TEXT NOT NULL,
    "pais" VARCHAR(2) NOT NULL,
    "moneda_funcional" VARCHAR(3) NOT NULL,
    "fecha_inicio" DATE,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planes_de_cuentas" (
    "id" SERIAL NOT NULL,
    "grupo_economico_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planes_de_cuentas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuentas" (
    "id" SERIAL NOT NULL,
    "plan_de_cuentas_id" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cuenta_padre_id" INTEGER,
    "tipo" "TipoCuenta" NOT NULL,
    "nivel" INTEGER NOT NULL,
    "imputable" BOOLEAN NOT NULL DEFAULT true,
    "requiere_auxiliar" BOOLEAN NOT NULL DEFAULT false,
    "tipo_auxiliar" "TipoAuxiliar",
    "moneda" "Moneda" NOT NULL DEFAULT 'FUNCIONAL',
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "naturaleza" "NaturalezaCuenta",
    "categoria_niif" "CategoriaNIIF",
    "metodo_valuacion" "MetodoValuacion",

    CONSTRAINT "cuentas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_cambio" (
    "id" SERIAL NOT NULL,
    "grupo_economico_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "moneda_origen" VARCHAR(3) NOT NULL,
    "moneda_destino" VARCHAR(3) NOT NULL,
    "tipo_cambio" DECIMAL(10,4) NOT NULL,
    "fuente" VARCHAR(100),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipos_cambio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodos_contables" (
    "id" SERIAL NOT NULL,
    "grupo_economico_id" INTEGER NOT NULL,
    "tipo" "TipoPeriodo" NOT NULL,
    "ejercicio" INTEGER NOT NULL,
    "mes" INTEGER,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "cerrado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_cierre" TIMESTAMP(3),
    "cerrado_por" INTEGER,

    CONSTRAINT "periodos_contables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_contable" (
    "id" SERIAL NOT NULL,
    "grupo_economico_id" INTEGER NOT NULL,
    "permitir_asientos_periodo_cerrado" BOOLEAN NOT NULL DEFAULT false,
    "requiere_aprobacion_global" BOOLEAN NOT NULL DEFAULT false,
    "monto_minimo_aprobacion" DECIMAL(18,2),
    "permitir_asientos_descuadrados" BOOLEAN NOT NULL DEFAULT false,
    "decimales_monto" INTEGER NOT NULL DEFAULT 2,
    "decimales_tipo_cambio" INTEGER NOT NULL DEFAULT 4,

    CONSTRAINT "configuracion_contable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates_asiento" (
    "id" SERIAL NOT NULL,
    "grupo_economico_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoAsiento" NOT NULL,
    "requiere_aprobacion" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "templates_asiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asientos" (
    "id" SERIAL NOT NULL,
    "grupo_economico_id" INTEGER NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "fecha_sistema" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT NOT NULL,
    "tipo" "TipoAsiento" NOT NULL DEFAULT 'DIARIO',
    "estado" "EstadoAsiento" NOT NULL DEFAULT 'BORRADOR',
    "creado_por" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificado_en" TIMESTAMP(3),
    "aprobado_por" INTEGER,
    "aprobado_en" TIMESTAMP(3),
    "motivo_rechazo" TEXT,

    CONSTRAINT "asientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lineas_asiento" (
    "id" SERIAL NOT NULL,
    "asiento_id" INTEGER NOT NULL,
    "cuenta_id" INTEGER NOT NULL,
    "debe" DECIMAL(18,2) NOT NULL,
    "haber" DECIMAL(18,2) NOT NULL,
    "moneda" VARCHAR(3) NOT NULL,
    "tipo_cambio" DECIMAL(10,4),
    "auxiliar_tipo" "TipoAuxiliar",
    "auxiliar_id" INTEGER,
    "auxiliar_nombre" VARCHAR(255),
    "centro_costo" VARCHAR(100),
    "glosa" TEXT,
    "codigo_cuenta" VARCHAR(50) NOT NULL,
    "nombre_cuenta" VARCHAR(255) NOT NULL,
    "tipo_cuenta" "TipoCuenta" NOT NULL,

    CONSTRAINT "lineas_asiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obligaciones" (
    "id" SERIAL NOT NULL,
    "grupo_economico_id" INTEGER NOT NULL,
    "tipo" "TipoObligacion" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto_total" DECIMAL(18,2) NOT NULL,
    "moneda" VARCHAR(3) NOT NULL,
    "fecha_emision" DATE NOT NULL,
    "auxiliar_tipo" "TipoAuxiliar" NOT NULL,
    "auxiliar_id" INTEGER NOT NULL,
    "estado" "EstadoObligacion" NOT NULL DEFAULT 'ACTIVA',
    "asiento_origen_id" INTEGER,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "obligaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuotas_obligacion" (
    "id" SERIAL NOT NULL,
    "obligacion_id" INTEGER NOT NULL,
    "numero_cuota" INTEGER NOT NULL,
    "fecha_vencimiento" DATE NOT NULL,
    "monto" DECIMAL(18,2) NOT NULL,
    "monto_pagado" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "estado" "EstadoCuota" NOT NULL DEFAULT 'PENDIENTE',

    CONSTRAINT "cuotas_obligacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_obligacion" (
    "id" SERIAL NOT NULL,
    "obligacion_id" INTEGER NOT NULL,
    "cuota_id" INTEGER,
    "fecha_pago" DATE NOT NULL,
    "monto" DECIMAL(18,2) NOT NULL,
    "moneda" VARCHAR(3) NOT NULL,
    "tipo_cambio" DECIMAL(10,4),
    "asiento_id" INTEGER,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_obligacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "auth_provider_id" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_grupos" (
    "usuario_id" INTEGER NOT NULL,
    "grupo_economico_id" INTEGER NOT NULL,
    "rol" "Rol" NOT NULL,

    CONSTRAINT "usuarios_grupos_pkey" PRIMARY KEY ("usuario_id","grupo_economico_id")
);

-- CreateTable
CREATE TABLE "usuarios_empresas" (
    "usuario_id" INTEGER NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "puede_escribir" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "usuarios_empresas_pkey" PRIMARY KEY ("usuario_id","empresa_id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "grupo_economico_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "rut" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" SERIAL NOT NULL,
    "grupo_economico_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "rut" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "empresas_grupo_economico_id_idx" ON "empresas"("grupo_economico_id");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_grupo_economico_id_rut_key" ON "empresas"("grupo_economico_id", "rut");

-- CreateIndex
CREATE UNIQUE INDEX "planes_de_cuentas_grupo_economico_id_key" ON "planes_de_cuentas"("grupo_economico_id");

-- CreateIndex
CREATE INDEX "cuentas_plan_de_cuentas_id_idx" ON "cuentas"("plan_de_cuentas_id");

-- CreateIndex
CREATE INDEX "cuentas_tipo_idx" ON "cuentas"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "cuentas_plan_de_cuentas_id_codigo_key" ON "cuentas"("plan_de_cuentas_id", "codigo");

-- CreateIndex
CREATE INDEX "tipos_cambio_grupo_economico_id_fecha_idx" ON "tipos_cambio"("grupo_economico_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_cambio_grupo_economico_id_fecha_moneda_origen_moneda__key" ON "tipos_cambio"("grupo_economico_id", "fecha", "moneda_origen", "moneda_destino");

-- CreateIndex
CREATE INDEX "periodos_contables_grupo_economico_id_idx" ON "periodos_contables"("grupo_economico_id");

-- CreateIndex
CREATE UNIQUE INDEX "periodos_contables_grupo_economico_id_tipo_ejercicio_mes_key" ON "periodos_contables"("grupo_economico_id", "tipo", "ejercicio", "mes");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_contable_grupo_economico_id_key" ON "configuracion_contable"("grupo_economico_id");

-- CreateIndex
CREATE INDEX "templates_asiento_grupo_economico_id_idx" ON "templates_asiento"("grupo_economico_id");

-- CreateIndex
CREATE INDEX "asientos_fecha_idx" ON "asientos"("fecha");

-- CreateIndex
CREATE INDEX "asientos_grupo_economico_id_idx" ON "asientos"("grupo_economico_id");

-- CreateIndex
CREATE INDEX "asientos_empresa_id_idx" ON "asientos"("empresa_id");

-- CreateIndex
CREATE INDEX "asientos_estado_idx" ON "asientos"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "asientos_empresa_id_numero_key" ON "asientos"("empresa_id", "numero");

-- CreateIndex
CREATE INDEX "lineas_asiento_asiento_id_idx" ON "lineas_asiento"("asiento_id");

-- CreateIndex
CREATE INDEX "lineas_asiento_cuenta_id_idx" ON "lineas_asiento"("cuenta_id");

-- CreateIndex
CREATE INDEX "obligaciones_grupo_economico_id_idx" ON "obligaciones"("grupo_economico_id");

-- CreateIndex
CREATE INDEX "obligaciones_auxiliar_tipo_auxiliar_id_idx" ON "obligaciones"("auxiliar_tipo", "auxiliar_id");

-- CreateIndex
CREATE INDEX "cuotas_obligacion_obligacion_id_idx" ON "cuotas_obligacion"("obligacion_id");

-- CreateIndex
CREATE INDEX "cuotas_obligacion_fecha_vencimiento_idx" ON "cuotas_obligacion"("fecha_vencimiento");

-- CreateIndex
CREATE INDEX "pagos_obligacion_obligacion_id_idx" ON "pagos_obligacion"("obligacion_id");

-- CreateIndex
CREATE INDEX "pagos_obligacion_cuota_id_idx" ON "pagos_obligacion"("cuota_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_auth_provider_id_key" ON "usuarios"("auth_provider_id");

-- CreateIndex
CREATE INDEX "clientes_grupo_economico_id_idx" ON "clientes"("grupo_economico_id");

-- CreateIndex
CREATE INDEX "proveedores_grupo_economico_id_idx" ON "proveedores"("grupo_economico_id");

-- AddForeignKey
ALTER TABLE "empresas" ADD CONSTRAINT "empresas_grupo_economico_id_fkey" FOREIGN KEY ("grupo_economico_id") REFERENCES "grupos_economicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planes_de_cuentas" ADD CONSTRAINT "planes_de_cuentas_grupo_economico_id_fkey" FOREIGN KEY ("grupo_economico_id") REFERENCES "grupos_economicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas" ADD CONSTRAINT "cuentas_plan_de_cuentas_id_fkey" FOREIGN KEY ("plan_de_cuentas_id") REFERENCES "planes_de_cuentas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas" ADD CONSTRAINT "cuentas_cuenta_padre_id_fkey" FOREIGN KEY ("cuenta_padre_id") REFERENCES "cuentas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipos_cambio" ADD CONSTRAINT "tipos_cambio_grupo_economico_id_fkey" FOREIGN KEY ("grupo_economico_id") REFERENCES "grupos_economicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodos_contables" ADD CONSTRAINT "periodos_contables_grupo_economico_id_fkey" FOREIGN KEY ("grupo_economico_id") REFERENCES "grupos_economicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodos_contables" ADD CONSTRAINT "periodos_contables_cerrado_por_fkey" FOREIGN KEY ("cerrado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_contable" ADD CONSTRAINT "configuracion_contable_grupo_economico_id_fkey" FOREIGN KEY ("grupo_economico_id") REFERENCES "grupos_economicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "templates_asiento" ADD CONSTRAINT "templates_asiento_grupo_economico_id_fkey" FOREIGN KEY ("grupo_economico_id") REFERENCES "grupos_economicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asientos" ADD CONSTRAINT "asientos_grupo_economico_id_fkey" FOREIGN KEY ("grupo_economico_id") REFERENCES "grupos_economicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asientos" ADD CONSTRAINT "asientos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asientos" ADD CONSTRAINT "asientos_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asientos" ADD CONSTRAINT "asientos_aprobado_por_fkey" FOREIGN KEY ("aprobado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineas_asiento" ADD CONSTRAINT "lineas_asiento_asiento_id_fkey" FOREIGN KEY ("asiento_id") REFERENCES "asientos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineas_asiento" ADD CONSTRAINT "lineas_asiento_cuenta_id_fkey" FOREIGN KEY ("cuenta_id") REFERENCES "cuentas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obligaciones" ADD CONSTRAINT "obligaciones_grupo_economico_id_fkey" FOREIGN KEY ("grupo_economico_id") REFERENCES "grupos_economicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuotas_obligacion" ADD CONSTRAINT "cuotas_obligacion_obligacion_id_fkey" FOREIGN KEY ("obligacion_id") REFERENCES "obligaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_obligacion" ADD CONSTRAINT "pagos_obligacion_obligacion_id_fkey" FOREIGN KEY ("obligacion_id") REFERENCES "obligaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_obligacion" ADD CONSTRAINT "pagos_obligacion_cuota_id_fkey" FOREIGN KEY ("cuota_id") REFERENCES "cuotas_obligacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_grupos" ADD CONSTRAINT "usuarios_grupos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_grupos" ADD CONSTRAINT "usuarios_grupos_grupo_economico_id_fkey" FOREIGN KEY ("grupo_economico_id") REFERENCES "grupos_economicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_empresas" ADD CONSTRAINT "usuarios_empresas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_empresas" ADD CONSTRAINT "usuarios_empresas_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_grupo_economico_id_fkey" FOREIGN KEY ("grupo_economico_id") REFERENCES "grupos_economicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proveedores" ADD CONSTRAINT "proveedores_grupo_economico_id_fkey" FOREIGN KEY ("grupo_economico_id") REFERENCES "grupos_economicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
