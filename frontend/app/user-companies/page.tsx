'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import type {
  UserCompany,
  CreateUserCompanyDto,
  ListUserCompaniesFilters,
} from '@/types/user-company';
import { userCompaniesService } from '@/services/user-companies.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserCompaniesTable } from '@/components/user-companies/user-companies-table';
import { UserCompanyForm } from '@/components/user-companies/user-company-form';
import { UserCompaniesStats } from '@/components/user-companies/user-companies-stats';
import { MainLayout } from '@/components/layout/main-layout';
import { getErrorMessage } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Plus,
  Search,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function UserCompaniesPage() {
  const { t } = useTranslation();

  const [permissions, setPermissions] = useState<UserCompany[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<UserCompany | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const [filters, setFilters] = useState<ListUserCompaniesFilters>({
    page: 1,
    limit: 10,
    search: '',
  });

  // Mock data for dropdowns - in real app, fetch from API
  const [users] = useState([
    { id: 1, name: 'Admin User', email: 'admin@example.com' },
    { id: 2, name: 'John Doe', email: 'john@example.com' },
  ]);

  const [companies] = useState([
    { id: 1, name: 'Company A' },
    { id: 2, name: 'Company B' },
  ]);

  const loadPermissions = async (showSearchIndicator = false) => {
    try {
      if (showSearchIndicator) {
        setIsSearching(true);
      } else {
        setIsInitialLoading(true);
      }
      setError(null);
      const response = await userCompaniesService.list(filters);
      setPermissions(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsInitialLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: debouncedSearch,
      page: 1,
    }));
  }, [debouncedSearch]);

  useEffect(() => {
    if (isInitialLoading && filters.search === '') {
      loadPermissions(false);
    } else {
      loadPermissions(true);
    }
  }, [filters]);

  const handleCreate = async (data: CreateUserCompanyDto) => {
    await userCompaniesService.create(data);
    await loadPermissions(false);
  };

  const handleToggleWrite = async (permission: UserCompany) => {
    try {
      await userCompaniesService.update(permission.userId, permission.companyId, {
        canWrite: !permission.canWrite,
      });
      await loadPermissions(false);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleDelete = async (permission: UserCompany) => {
    if (!confirm(t('userCompanies.deleteConfirm.description'))) {
      return;
    }

    try {
      await userCompaniesService.delete(permission.userId, permission.companyId);
      await loadPermissions(false);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleOpenCreate = () => {
    setSelectedPermission(undefined);
    setIsFormOpen(true);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('userCompanies.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('userCompanies.description')}
          </p>
        </div>

        {!isInitialLoading && <UserCompaniesStats permissions={permissions} />}

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={t('userCompanies.searchPlaceholder')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
                )}
              </div>
            </div>

            <Button onClick={handleOpenCreate} size="default" className="gap-2">
              <Plus className="h-4 w-4" />
              {t('userCompanies.createButton')}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">{t('userCompanies.messages.loadError')}</h3>
                <p className="text-sm text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isInitialLoading && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium text-gray-600">{t('common.loading')}</p>
          </div>
        )}

        {!isInitialLoading && (
          <>
            <UserCompaniesTable
              permissions={permissions}
              onToggleWrite={handleToggleWrite}
              onDelete={handleDelete}
            />

            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('pagination.showing')} {permissions.length} {t('pagination.of')}{' '}
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

        <UserCompanyForm
          permission={selectedPermission}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleCreate}
          users={users}
          companies={companies}
        />
      </div>
    </MainLayout>
  );
}
