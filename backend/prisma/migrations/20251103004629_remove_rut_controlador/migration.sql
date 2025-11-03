-- DropColumn: Remove rut_controlador from grupos_economicos
-- Rationale: Un Grupo Económico es una agrupación lógica, no una entidad jurídica.
-- El RUT debe estar solo en la entidad Empresa (entidad jurídica individual).

ALTER TABLE "grupos_economicos" DROP COLUMN "rut_controlador";
