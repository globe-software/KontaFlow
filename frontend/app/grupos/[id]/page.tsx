'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { GrupoEconomico } from '@/types/grupo';
import { gruposApi } from '@/lib/api/grupos';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { getErrorMessage, formatDate } from '@/lib/utils';
import { PAISES, MONEDAS } from '@/lib/config';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Edit2,
  Loader2,
  Settings,
  Trash2,
  Users,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export default function GrupoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const grupoId = Number(params.id);

  const [grupo, setGrupo] = useState<GrupoEconomico | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGrupo();
  }, [grupoId]);

  const loadGrupo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await gruposApi.getById(grupoId);
      console.log('Grupo response:', response);
      console.log('Grupo data:', JSON.stringify(response, null, 2));
      setGrupo(response);
    } catch (err) {
      console.error('Error loading grupo:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    // Navegar a la lista con query param para abrir modal de edición
    router.push(`/grupos?edit=${grupoId}`);
  };

  const handleDelete = async () => {
    if (!grupo) return;
    if (!confirm(`¿Estás seguro de eliminar el grupo "${grupo.nombre}"?`)) {
      return;
    }

    try {
      await gruposApi.delete(grupo.id);
      router.push('/grupos');
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 px-6">
          <div className="flex min-h-[400px] flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium text-gray-600">Cargando grupo...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !grupo) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 px-6">
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Error al cargar grupo</h3>
                <p className="text-sm text-red-700 mt-0.5">
                  {error || 'Grupo no encontrado'}
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => router.push('/grupos')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Grupos
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-6">
        {/* Breadcrumb y acciones */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push('/grupos')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <span className="text-gray-400">/</span>
            <span className="text-sm text-gray-600">Grupos Económicos</span>
            <span className="text-gray-400">/</span>
            <span className="text-sm font-medium text-gray-900">{grupo.nombre}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleEdit} variant="outline" size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              size="sm"
              disabled={!grupo.activo}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Header Card */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {grupo.nombre}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>{PAISES[grupo.paisPrincipal]}</span>
                  <span>•</span>
                  <span>
                    {grupo.monedaBase} ({MONEDAS[grupo.monedaBase]})
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Creado el {formatDate(grupo.fechaCreacion)}
                </p>
              </div>
            </div>

            <div>
              {grupo.activo ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Activo
                </Badge>
              ) : (
                <Badge className="flex items-center gap-1 bg-gray-100 text-gray-700">
                  <XCircle className="h-3 w-3" />
                  Inactivo
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="info">
              <Building2 className="h-4 w-4 mr-2" />
              Información
            </TabsTrigger>
            <TabsTrigger value="empresas">
              <Users className="h-4 w-4 mr-2" />
              Empresas ({grupo._count?.empresas || 0})
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información General
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nombre</label>
                  <p className="mt-1 text-gray-900">{grupo.nombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">País Principal</label>
                  <p className="mt-1 text-gray-900">{PAISES[grupo.paisPrincipal]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Moneda Base</label>
                  <p className="mt-1 text-gray-900">
                    {grupo.monedaBase} - {MONEDAS[grupo.monedaBase]}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Estado</label>
                  <p className="mt-1">
                    {grupo.activo ? (
                      <span className="text-green-600 font-medium">Activo</span>
                    ) : (
                      <span className="text-gray-600 font-medium">Inactivo</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha de Creación</label>
                  <p className="mt-1 text-gray-900">{formatDate(grupo.fechaCreacion)}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="empresas">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Empresas Asociadas
                </h3>
                <Button size="sm">
                  <Building2 className="h-4 w-4 mr-2" />
                  Agregar Empresa
                </Button>
              </div>
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No hay empresas asociadas a este grupo</p>
                <p className="text-sm mt-1">
                  Las empresas que agregues aparecerán aquí
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="config">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Configuración Contable
              </h3>
              <div className="text-center py-12 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>La configuración contable estará disponible próximamente</p>
                <p className="text-sm mt-1">
                  Plan de cuentas, ejercicios fiscales, etc.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
