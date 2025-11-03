'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/contexts/I18nContext';
import type {
  Account,
  CreateAccountDto,
  ListAccountsFilters,
  AccountType,
} from '@/types/account';
import { accountsService } from '@/services/accounts.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AccountsTable } from '@/components/accounts/accounts-table';
import { AccountsTree } from '@/components/accounts/accounts-tree';
import { AccountForm } from '@/components/accounts/account-form';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  List,
  GitBranch,
} from 'lucide-react';

const ACCOUNT_TYPES: AccountType[] = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];

export default function AccountsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [treeAccounts, setTreeAccounts] = useState<Account[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>();
  const [parentAccountForNew, setParentAccountForNew] = useState<Account | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
  const [chartOfAccountsId] = useState(1); // TODO: Load from API or user selection

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    byType: {} as Record<string, number>,
  });

  // Local search input (without debounce)
  const [searchInput, setSearchInput] = useState('');

  // Debounced search value (with 400ms delay)
  const debouncedSearch = useDebounce(searchInput, 400);

  // Filters
  const [filters, setFilters] = useState<ListAccountsFilters>({
    page: 1,
    limit: 100,
    search: '',
    chartOfAccountsId,
    type: undefined,
    postable: undefined,
    active: undefined,
  });

  // Load accounts
  const loadAccounts = async (showSearchIndicator = false) => {
    try {
      if (showSearchIndicator) {
        setIsSearching(true);
      } else {
        setIsInitialLoading(true);
      }
      setError(null);

      if (viewMode === 'tree') {
        // Load tree structure
        const response = await accountsService.getTree(chartOfAccountsId);
        setTreeAccounts(response.data);
        // Also calculate stats
        calculateStats(response.data);
      } else {
        // Load flat list
        const response = await accountsService.list(filters);
        setAccounts(response.data);
        calculateStats(response.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsInitialLoading(false);
      setIsSearching(false);
    }
  };

  const calculateStats = (accountsList: Account[]) => {
    const flatList = flattenTree(accountsList);
    const byType: Record<string, number> = {};
    flatList.forEach(acc => {
      byType[acc.type] = (byType[acc.type] || 0) + 1;
    });
    setStats({
      total: flatList.length,
      byType,
    });
  };

  const flattenTree = (accounts: Account[]): Account[] => {
    const result: Account[] = [];
    accounts.forEach(acc => {
      result.push(acc);
      if (acc.subaccounts && acc.subaccounts.length > 0) {
        result.push(...flattenTree(acc.subaccounts));
      }
    });
    return result;
  };

  // Effect to update filters when debouncedSearch changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: debouncedSearch,
      page: 1  // Reset to page 1 when searching
    }));
  }, [debouncedSearch]);

  // Effect to load accounts when filters or view mode change
  useEffect(() => {
    // On first render
    if (isInitialLoading && filters.search === '') {
      loadAccounts(false);
    } else {
      // Subsequent searches
      loadAccounts(true);
    }
  }, [filters, viewMode]);

  // Create account
  const handleCreate = async (data: CreateAccountDto) => {
    await accountsService.create(data);
    await loadAccounts(false);
    setParentAccountForNew(undefined);
  };

  // Edit account
  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setParentAccountForNew(undefined);
    setIsFormOpen(true);
  };

  // Update account
  const handleUpdate = async (data: CreateAccountDto) => {
    if (!selectedAccount) return;
    await accountsService.update(selectedAccount.id, data);
    await loadAccounts(false);
  };

  // Delete account
  const handleDelete = async (account: Account) => {
    if (!confirm(t('accounts.deleteConfirm.description'))) {
      return;
    }

    try {
      await accountsService.delete(account.id);
      await loadAccounts(false);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  // Add child to parent
  const handleAddChild = (parent: Account) => {
    setParentAccountForNew(parent);
    setSelectedAccount(undefined);
    setIsFormOpen(true);
  };

  // Filter handlers
  const handleTypeFilter = (value: string) => {
    setFilters({
      ...filters,
      type: value === 'all' ? undefined : (value as AccountType),
      page: 1,
    });
  };

  const handlePostableFilter = (value: string) => {
    setFilters({
      ...filters,
      postable: value === 'all' ? undefined : value === 'true',
      page: 1,
    });
  };

  // Open create form
  const handleOpenCreate = () => {
    setSelectedAccount(undefined);
    setParentAccountForNew(undefined);
    setIsFormOpen(true);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('accounts.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('accounts.subtitle')}
          </p>
        </div>

        {/* Statistics */}
        {!isInitialLoading && (
          <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-600">{t('accounts.stats.total')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            {ACCOUNT_TYPES.map(type => (
              <div key={type} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-gray-600">{t(`accounts.types.${type}`)}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.byType[type] || 0}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters and actions */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
              {/* View mode toggle */}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'tree' | 'table')}>
                <TabsList>
                  <TabsTrigger value="tree" className="gap-2">
                    <GitBranch className="h-4 w-4" />
                    {t('accounts.viewModes.tree')}
                  </TabsTrigger>
                  <TabsTrigger value="table" className="gap-2">
                    <List className="h-4 w-4" />
                    {t('accounts.viewModes.table')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Search */}
              {viewMode === 'table' && (
                <>
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder={t('accounts.searchPlaceholder')}
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
                        <SelectValue placeholder={t('accounts.filters.byType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('accounts.filters.all')}</SelectItem>
                        {ACCOUNT_TYPES.map(type => (
                          <SelectItem key={type} value={type}>
                            {t(`accounts.types.${type}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filter by postable */}
                  <Select
                    value={
                      filters.postable === undefined
                        ? 'all'
                        : filters.postable
                        ? 'true'
                        : 'false'
                    }
                    onValueChange={handlePostableFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t('accounts.filters.postable')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('accounts.filters.all')}</SelectItem>
                      <SelectItem value="true">{t('accounts.filters.postableOnly')}</SelectItem>
                      <SelectItem value="false">{t('accounts.filters.nonPostable')}</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            {/* Create button */}
            <Button onClick={handleOpenCreate} size="default" className="gap-2">
              <Plus className="h-4 w-4" />
              {t('accounts.createButton')}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">{t('accounts.messages.loadError')}</h3>
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

        {/* Content - Tree or Table view */}
        {!isInitialLoading && (
          <>
            {viewMode === 'tree' ? (
              <AccountsTree
                accounts={treeAccounts}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddChild={handleAddChild}
              />
            ) : (
              <AccountsTable
                accounts={accounts}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </>
        )}

        {/* Create/edit form */}
        <AccountForm
          account={selectedAccount}
          parentAccount={parentAccountForNew}
          chartOfAccountsId={chartOfAccountsId}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={selectedAccount ? handleUpdate : handleCreate}
        />
      </div>
    </MainLayout>
  );
}
