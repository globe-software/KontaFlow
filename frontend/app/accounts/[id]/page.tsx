'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Account } from '@/types/account';
import { accountsService } from '@/services/accounts.service';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/contexts/I18nContext';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { getErrorMessage } from '@/lib/utils';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Edit2,
  Loader2,
  Trash2,
  XCircle,
  AlertCircle,
  GitBranch,
} from 'lucide-react';

export default function AccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const accountId = Number(params.id);

  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAccount();
  }, [accountId]);

  const loadAccount = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await accountsService.getById(accountId);
      setAccount(response.data);
    } catch (err) {
      console.error('Error loading account:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/accounts?edit=${accountId}`);
  };

  const handleDelete = async () => {
    if (!account) return;
    if (!confirm(t('accounts.deleteConfirm.description'))) {
      return;
    }

    try {
      await accountsService.delete(account.id);
      router.push('/accounts');
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ASSET':
        return 'bg-blue-100 text-blue-700';
      case 'LIABILITY':
        return 'bg-red-100 text-red-700';
      case 'EQUITY':
        return 'bg-purple-100 text-purple-700';
      case 'INCOME':
        return 'bg-green-100 text-green-700';
      case 'EXPENSE':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 px-6">
          <div className="flex min-h-[400px] flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !account) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 px-6">
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">{t('accounts.messages.loadError')}</h3>
                <p className="text-sm text-red-700 mt-0.5">
                  {error || t('accounts.notFound')}
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => router.push('/accounts')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-6">
        {/* Breadcrumb and actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push('/accounts')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            <span className="text-gray-400">/</span>
            <span className="text-sm text-gray-600">{t('accounts.title')}</span>
            <span className="text-gray-400">/</span>
            <span className="text-sm font-medium text-gray-900">{account.code}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleEdit} variant="outline" size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              {t('common.edit')}
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              size="sm"
              disabled={!account.active || (account._count?.subaccounts || 0) > 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('common.delete')}
            </Button>
          </div>
        </div>

        {/* Header Card */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900 font-mono">
                    {account.code}
                  </h1>
                  <Badge className={getTypeColor(account.type)}>
                    {t(`accounts.types.${account.type}`)}
                  </Badge>
                </div>
                <p className="text-lg text-gray-700 mb-2">{account.name}</p>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>{t('accounts.level')} {account.level}</span>
                  <span>•</span>
                  <span>{account.currency}</span>
                  {account.postable && (
                    <>
                      <span>•</span>
                      <span className="text-green-600 font-medium">{t('accounts.postable')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              {account.active ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {t('common.active')}
                </Badge>
              ) : (
                <Badge className="flex items-center gap-1 bg-gray-100 text-gray-700">
                  <XCircle className="h-3 w-3" />
                  {t('common.inactive')}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="info">
              <FileText className="h-4 w-4 mr-2" />
              {t('accounts.details.information')}
            </TabsTrigger>
            <TabsTrigger value="hierarchy">
              <GitBranch className="h-4 w-4 mr-2" />
              {t('accounts.details.hierarchy')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('accounts.details.generalInformation')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('accounts.table.code')}</label>
                  <p className="mt-1 text-gray-900 font-mono">{account.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('accounts.table.name')}</label>
                  <p className="mt-1 text-gray-900">{account.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('accounts.table.type')}</label>
                  <p className="mt-1">
                    <Badge className={getTypeColor(account.type)}>
                      {t(`accounts.types.${account.type}`)}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('accounts.table.level')}</label>
                  <p className="mt-1 text-gray-900">{account.level}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('accounts.table.currency')}</label>
                  <p className="mt-1 text-gray-900">{account.currency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('accounts.table.postable')}</label>
                  <p className="mt-1">
                    {account.postable ? (
                      <span className="text-green-600 font-medium">{t('common.yes')}</span>
                    ) : (
                      <span className="text-gray-600 font-medium">{t('common.no')}</span>
                    )}
                  </p>
                </div>
                {account.nature && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('accounts.form.natureLabel')}</label>
                    <p className="mt-1 text-gray-900">{t(`accounts.natures.${account.nature}`)}</p>
                  </div>
                )}
                {account.requiresAuxiliary && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-700">{t('accounts.form.requiresAuxiliaryLabel')}</label>
                      <p className="mt-1 text-green-600 font-medium">{t('common.yes')}</p>
                    </div>
                    {account.auxiliaryType && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('accounts.form.auxiliaryTypeLabel')}</label>
                        <p className="mt-1 text-gray-900">{t(`accounts.auxiliaryTypes.${account.auxiliaryType}`)}</p>
                      </div>
                    )}
                  </>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('accounts.table.status')}</label>
                  <p className="mt-1">
                    {account.active ? (
                      <span className="text-green-600 font-medium">{t('common.active')}</span>
                    ) : (
                      <span className="text-gray-600 font-medium">{t('common.inactive')}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hierarchy">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('accounts.details.hierarchy')}
              </h3>

              {/* Parent Account */}
              {account.parentAccount && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700">{t('accounts.details.parentAccount')}</label>
                  <div className="mt-2 p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <p className="font-mono text-sm font-medium text-gray-900">
                      {account.parentAccount.code} - {account.parentAccount.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Subaccounts */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  {t('accounts.details.subaccounts')} ({account._count?.subaccounts || 0})
                </label>
                {account.subaccounts && account.subaccounts.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {account.subaccounts.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => router.push(`/accounts/${sub.id}`)}
                      >
                        <p className="font-mono text-sm font-medium text-gray-900">
                          {sub.code} - {sub.name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">{t('accounts.details.noSubaccounts')}</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
