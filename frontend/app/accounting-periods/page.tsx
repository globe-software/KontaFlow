'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/contexts/I18nContext';
import type {
  AccountingPeriod,
  CreateAccountingPeriodDto,
  ListAccountingPeriodsFilters,
  PeriodType,
} from '@/types/accounting-period';
import { accountingPeriodsService } from '@/services/accounting-periods.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PeriodsTable } from '@/components/accounting-periods/periods-table';
import { PeriodForm } from '@/components/accounting-periods/period-form';
import { PeriodsStats } from '@/components/accounting-periods/periods-stats';
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
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function AccountingPeriodsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<AccountingPeriod | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Local search input (without debounce)
  const [searchInput, setSearchInput] = useState('');

  // Debounced search value (with 400ms delay)
  const debouncedSearch = useDebounce(searchInput, 400);

  // Filters
  const [filters, setFilters] = useState<ListAccountingPeriodsFilters>({
    page: 1,
    limit: 10,
    search: '',
    type: undefined,
    fiscalYear: undefined,
    closed: undefined,
  });

  // Load periods
  const loadPeriods = async (showSearchIndicator = false) => {
    try {
      if (showSearchIndicator) {
        setIsSearching(true);
      } else {
        setIsInitialLoading(true);
      }
      setError(null);
      const response = await accountingPeriodsService.list(filters);
      setPeriods(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsInitialLoading(false);
      setIsSearching(false);
    }
  };

  // Effect to update filters when debouncedSearch changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: debouncedSearch,
      page: 1  // Reset to page 1 when searching
    }));
  }, [debouncedSearch]);

  // Effect to load periods when filters change
  useEffect(() => {
    // On first render
    if (isInitialLoading && filters.search === '') {
      loadPeriods(false);
    } else {
      // Subsequent searches
      loadPeriods(true);
    }
  }, [filters]);

  // Create period
  const handleCreate = async (data: CreateAccountingPeriodDto) => {
    await accountingPeriodsService.create(data);
    await loadPeriods(false);
  };

  // Edit period
  const handleEdit = (period: AccountingPeriod) => {
    setSelectedPeriod(period);
    setIsFormOpen(true);
  };

  // Update period
  const handleUpdate = async (data: CreateAccountingPeriodDto) => {
    if (!selectedPeriod) return;
    await accountingPeriodsService.update(selectedPeriod.id, data);
    await loadPeriods(false);
  };

  // Delete period
  const handleDelete = async (period: AccountingPeriod) => {
    if (!confirm(t('periods.deleteConfirm.description'))) {
      return;
    }

    try {
      await accountingPeriodsService.delete(period.id);
      await loadPeriods(false);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // Close period
  const handleClose = async (period: AccountingPeriod) => {
    if (!confirm(t('periods.closeConfirm.description'))) {
      return;
    }

    try {
      await accountingPeriodsService.closePeriod(period.id);
      await loadPeriods(false);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // Reopen period
  const handleReopen = async (period: AccountingPeriod) => {
    if (!confirm(t('periods.reopenConfirm.description'))) {
      return;
    }

    try {
      await accountingPeriodsService.reopenPeriod(period.id);
      await loadPeriods(false);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // Filter handlers
  const handleTypeFilter = (value: string) => {
    setFilters({
      ...filters,
      type: value === 'all' ? undefined : (value as PeriodType),
      page: 1,
    });
  };

  const handleClosedFilter = (value: string) => {
    setFilters({
      ...filters,
      closed: value === 'all' ? undefined : value === 'true',
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  // Open create form
  const handleOpenCreate = () => {
    setSelectedPeriod(undefined);
    setIsFormOpen(true);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('periods.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('periods.subtitle')}
          </p>
        </div>

        {/* Statistics - only show when not initial loading */}
        {!isInitialLoading && <PeriodsStats periods={periods} />}

        {/* Filters and actions */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={t('periods.searchPlaceholder')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
                )}
              </div>

              {/* Filter by type */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select
                  value={filters.type || 'all'}
                  onValueChange={handleTypeFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('periods.filters.byType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('periods.filters.all')}</SelectItem>
                    <SelectItem value="FISCAL_YEAR">{t('periods.types.FISCAL_YEAR')}</SelectItem>
                    <SelectItem value="MONTH">{t('periods.types.MONTH')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter by status */}
              <Select
                value={
                  filters.closed === undefined
                    ? 'all'
                    : filters.closed
                    ? 'true'
                    : 'false'
                }
                onValueChange={handleClosedFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('periods.filters.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('periods.filters.all')}</SelectItem>
                  <SelectItem value="false">{t('periods.status.open')}</SelectItem>
                  <SelectItem value="true">{t('periods.status.closed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Create button */}
            <Button onClick={handleOpenCreate} size="default" className="gap-2">
              <Plus className="h-4 w-4" />
              {t('periods.createButton')}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">{t('periods.messages.loadError')}</h3>
                <p className="text-sm text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Initial loading */}
        {isInitialLoading && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium text-gray-600">{t('common.loading')}</p>
          </div>
        )}

        {/* Table - always show after initial load */}
        {!isInitialLoading && (
          <>
            <PeriodsTable
              periods={periods}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClose={handleClose}
              onReopen={handleReopen}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('pagination.showing')} {periods.length} {t('pagination.of')} {pagination.total} {t('pagination.results')}
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
        <PeriodForm
          period={selectedPeriod}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={selectedPeriod ? handleUpdate : handleCreate}
        />
      </div>
    </MainLayout>
  );
}
