'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/contexts/I18nContext';
import type {
  EconomicGroup,
  CreateEconomicGroupDto,
  ListEconomicGroupsFilters,
} from '@/types/economic-group';
import { economicGroupsService } from '@/services/economic-groups.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EconomicGroupsTable } from '@/components/economic-groups/economic-groups-table';
import { EconomicGroupForm } from '@/components/economic-groups/economic-group-form';
import { EconomicGroupsStats } from '@/components/economic-groups/economic-groups-stats';
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

export default function EconomicGroupsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [groups, setGroups] = useState<EconomicGroup[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<EconomicGroup | undefined>();
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
  const [filters, setFilters] = useState<ListEconomicGroupsFilters>({
    page: 1,
    limit: 10,
    search: '',
    mainCountry: undefined,
    active: undefined,
  });

  // Cargar grupos
  const loadGroups = async (showSearchIndicator = false) => {
    try {
      if (showSearchIndicator) {
        setIsSearching(true);
      } else {
        setIsInitialLoading(true);
      }
      setError(null);
      const response = await economicGroupsService.list(filters);
      setGroups(response.data);
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
      loadGroups(false);
    } else {
      // Búsqueda subsecuente
      loadGroups(true);
    }
  }, [filters]);

  // Effect to detect query param edit=ID
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      const groupId = Number(editId);
      // Load the group to edit
      economicGroupsService.getById(groupId).then((response) => {
        setSelectedGroup(response.data);
        setIsFormOpen(true);
        // Clear query param
        router.replace('/economic-groups', { scroll: false });
      }).catch((err) => {
        console.error('Error loading group for edit:', err);
      });
    }
  }, [searchParams, router]);

  // Crear grupo
  const handleCreate = async (data: CreateEconomicGroupDto) => {
    await economicGroupsService.create(data);
    await loadGroups(false);
  };

  // Edit group
  const handleEdit = (group: EconomicGroup) => {
    setSelectedGroup(group);
    setIsFormOpen(true);
  };

  // Actualizar grupo
  const handleUpdate = async (data: CreateEconomicGroupDto) => {
    if (!selectedGroup) return;
    await economicGroupsService.update(selectedGroup.id, data);
    await loadGroups(false);
  };

  // Delete group
  const handleDelete = async (group: EconomicGroup) => {
    if (!confirm(t('grupos.deleteConfirm.description'))) {
      return;
    }

    try {
      await economicGroupsService.delete(group.id);
      await loadGroups(false);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // Manejadores de filtros
  const handlePaisFilter = (value: string) => {
    setFilters({
      ...filters,
      mainCountry: value === 'all' ? undefined : (value as any),
      page: 1,
    });
  };

  const handleActivoFilter = (value: string) => {
    setFilters({
      ...filters,
      active: value === 'all' ? undefined : value === 'true',
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  // Open create form
  const handleOpenCreate = () => {
    setSelectedGroup(undefined);
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

        {/* Statistics - only show when not initial loading */}
        {!isInitialLoading && <EconomicGroupsStats groups={groups} />}

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
                  value={filters.mainCountry || 'all'}
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
                  filters.active === undefined
                    ? 'all'
                    : filters.active
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

        {/* Table - always show after initial load */}
        {!isInitialLoading && (
          <>
            <EconomicGroupsTable
              groups={groups}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('pagination.showing')} {groups.length} {t('pagination.of')} {pagination.total} {t('pagination.results')}
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

        {/* Create/edit form */}
        <EconomicGroupForm
          group={selectedGroup}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={selectedGroup ? handleUpdate : handleCreate}
        />
      </div>
    </MainLayout>
  );
}
