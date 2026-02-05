'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import type { Currency, CreateCurrencyDto, ListCurrenciesFilters } from '@/types/currency';
import { currenciesService } from '@/services/currencies.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrenciesTable } from '@/components/currencies/currencies-table';
import { CurrencyForm } from '@/components/currencies/currency-form';
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
import { DollarSign, Plus, Search, Filter, Loader2, AlertCircle } from 'lucide-react';

export default function CurrenciesPage() {
  const { t } = useTranslation();

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  // Local search input (without debounce)
  const [searchInput, setSearchInput] = useState('');

  // Debounced search value (with 400ms delay)
  const debouncedSearch = useDebounce(searchInput, 400);

  // Filters
  const [filters, setFilters] = useState<ListCurrenciesFilters>({
    page: 1,
    limit: 50,
    search: '',
    active: undefined,
  });

  // Load currencies
  const loadCurrencies = async (showSearchIndicator = false) => {
    try {
      if (showSearchIndicator) {
        setIsSearching(true);
      } else {
        setIsInitialLoading(true);
      }
      setError(null);
      const response = await currenciesService.list(filters);
      setCurrencies(response.data);
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
    setFilters((prev) => ({
      ...prev,
      search: debouncedSearch,
      page: 1, // Reset to page 1 when searching
    }));
  }, [debouncedSearch]);

  // Effect to load currencies when filters change
  useEffect(() => {
    // On first render
    if (isInitialLoading && filters.search === '') {
      loadCurrencies(false);
    } else {
      // Subsequent searches
      loadCurrencies(true);
    }
  }, [filters]);

  // Create currency
  const handleCreate = async (data: CreateCurrencyDto) => {
    await currenciesService.create(data);
    await loadCurrencies(false);
  };

  // Edit currency
  const handleEdit = (currency: Currency) => {
    setSelectedCurrency(currency);
    setIsFormOpen(true);
  };

  // Update currency
  const handleUpdate = async (data: CreateCurrencyDto) => {
    if (!selectedCurrency) return;
    await currenciesService.update(selectedCurrency.code, data);
    await loadCurrencies(false);
  };

  // Delete currency
  const handleDelete = async (currency: Currency) => {
    if (!confirm(t('currencies.deleteConfirm.description'))) {
      return;
    }

    try {
      await currenciesService.delete(currency.code);
      await loadCurrencies(false);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // Filter handlers
  const handleActiveFilter = (value: string) => {
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
    setSelectedCurrency(undefined);
    setIsFormOpen(true);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('currencies.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">{t('currencies.subtitle')}</p>
        </div>

        {/* Filters and actions */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={t('currencies.searchPlaceholder')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
                )}
              </div>

              {/* Filter by status */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select
                  value={
                    filters.active === undefined ? 'all' : filters.active ? 'true' : 'false'
                  }
                  onValueChange={handleActiveFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('currencies.filters.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('currencies.filters.all')}</SelectItem>
                    <SelectItem value="true">{t('currencies.status.active')}</SelectItem>
                    <SelectItem value="false">{t('currencies.status.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Create button */}
            <Button onClick={handleOpenCreate} size="default" className="gap-2">
              <Plus className="h-4 w-4" />
              {t('currencies.createButton')}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">
                  {t('currencies.messages.loadError')}
                </h3>
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
            <CurrenciesTable
              currencies={currencies}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('pagination.showing')} {currencies.length} {t('pagination.of')}{' '}
                  {pagination.total} {t('pagination.results')}
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
                      {t('pagination.page')} {pagination.page} {t('pagination.of')}{' '}
                      {pagination.totalPages}
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
        <CurrencyForm
          currency={selectedCurrency}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={selectedCurrency ? handleUpdate : handleCreate}
        />
      </div>
    </MainLayout>
  );
}
