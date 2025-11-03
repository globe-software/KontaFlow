'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/contexts/I18nContext';
import type {
  GrupoEconomico,
  CreateGrupoDto,
  ListGruposFilters,
} from '@/types/grupo';
import { gruposApi } from '@/lib/api/grupos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GruposTable } from '@/components/grupos/grupos-table';
import { GrupoForm } from '@/components/grupos/grupo-form';
import { GruposStats } from '@/components/grupos/grupos-stats';
import { MainLayout } from '@/components/layout/main-layout';
import { getErrorMessage } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PAISES } from '@/lib/config';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function GruposPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [grupos, setGrupos] = useState<GrupoEconomico[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoEconomico | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Estado local del input de búsqueda (sin debounce)
  const [searchInput, setSearchInput] = useState('');

  // Valor debounced de búsqueda (con delay de 400ms)
  const debouncedSearch = useDebounce(searchInput, 400);

  // Filtros
  const [filters, setFilters] = useState<ListGruposFilters>({
    page: 1,
    limit: 10,
    search: '',
    paisPrincipal: undefined,
    activo: undefined,
  });

  // Cargar grupos
  const loadGrupos = async (showSearchIndicator = false) => {
    try {
      if (showSearchIndicator) {
        setIsSearching(true);
      } else {
        setIsInitialLoading(true);
      }
      setError(null);
      const response = await gruposApi.list(filters);
      setGrupos(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsInitialLoading(false);
      setIsSearching(false);
    }
  };

  // Efecto para actualizar filtros cuando cambia el debouncedSearch
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: debouncedSearch,
      page: 1  // Reset a página 1 al buscar
    }));
  }, [debouncedSearch]);

  // Efecto para cargar grupos cuando cambian los filtros
  useEffect(() => {
    // En el primer render
    if (isInitialLoading && filters.search === '') {
      loadGrupos(false);
    } else {
      // Búsqueda subsecuente
      loadGrupos(true);
    }
  }, [filters]);

  // Efecto para detectar query param edit=ID
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      const grupoId = Number(editId);
      // Cargar el grupo para editar
      gruposApi.getById(grupoId).then((grupo) => {
        setSelectedGrupo(grupo);
        setIsFormOpen(true);
        // Limpiar query param
        router.replace('/grupos', { scroll: false });
      }).catch((err) => {
        console.error('Error loading grupo for edit:', err);
      });
    }
  }, [searchParams, router]);

  // Crear grupo
  const handleCreate = async (data: CreateGrupoDto) => {
    await gruposApi.create(data);
    await loadGrupos(false);
  };

  // Editar grupo
  const handleEdit = (grupo: GrupoEconomico) => {
    setSelectedGrupo(grupo);
    setIsFormOpen(true);
  };

  // Actualizar grupo
  const handleUpdate = async (data: CreateGrupoDto) => {
    if (!selectedGrupo) return;
    await gruposApi.update(selectedGrupo.id, data);
    await loadGrupos(false);
  };

  // Eliminar grupo
  const handleDelete = async (grupo: GrupoEconomico) => {
    if (!confirm(t('grupos.deleteConfirm.description'))) {
      return;
    }

    try {
      await gruposApi.delete(grupo.id);
      await loadGrupos(false);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // Manejadores de filtros
  const handlePaisFilter = (value: string) => {
    setFilters({
      ...filters,
      paisPrincipal: value === 'all' ? undefined : (value as any),
      page: 1,
    });
  };

  const handleActivoFilter = (value: string) => {
    setFilters({
      ...filters,
      activo: value === 'all' ? undefined : value === 'true',
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  // Abrir formulario de crear
  const handleOpenCreate = () => {
    setSelectedGrupo(undefined);
    setIsFormOpen(true);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-6">
        {/* Header simplificado */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('grupos.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('grupos.emptyStateDescription')}
          </p>
        </div>

        {/* Estadísticas - solo mostrar cuando no es carga inicial */}
        {!isInitialLoading && <GruposStats grupos={grupos} />}

        {/* Filtros y acciones - Card mejorado */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
              {/* Búsqueda con ícono y indicador de búsqueda */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={t('grupos.searchPlaceholder')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
                )}
              </div>

              {/* Filtro por país con ícono */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select
                  value={filters.paisPrincipal || 'all'}
                  onValueChange={handlePaisFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('grupos.filters.byCountry')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('grupos.filters.all')}</SelectItem>
                    {Object.entries(PAISES).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por estado */}
              <Select
                value={
                  filters.activo === undefined
                    ? 'all'
                    : filters.activo
                    ? 'true'
                    : 'false'
                }
                onValueChange={handleActivoFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('common.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('grupos.filters.all')}</SelectItem>
                  <SelectItem value="true">{t('grupos.filters.active')}</SelectItem>
                  <SelectItem value="false">{t('grupos.filters.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botón crear con ícono */}
            <Button onClick={handleOpenCreate} size="default" className="gap-2">
              <Plus className="h-4 w-4" />
              {t('grupos.createButton')}
            </Button>
          </div>
        </div>

        {/* Error mejorado */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">{t('grupos.messages.loadError')}</h3>
                <p className="text-sm text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading inicial - pantalla completa */}
        {isInitialLoading && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium text-gray-600">{t('common.loading')}</p>
          </div>
        )}

        {/* Tabla - mostrar siempre después de carga inicial */}
        {!isInitialLoading && (
          <>
            <GruposTable
              grupos={grupos}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('pagination.showing')} {grupos.length} {t('pagination.of')} {pagination.total} {t('pagination.results')}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    {t('common.previous')}
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {t('pagination.page')} {pagination.page} {t('pagination.of')} {pagination.totalPages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Formulario de crear/editar */}
        <GrupoForm
          grupo={selectedGrupo}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={selectedGrupo ? handleUpdate : handleCreate}
        />
      </div>
    </MainLayout>
  );
}
