'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { AccountingPeriod } from '@/types/accounting-period';
import { accountingPeriodsService } from '@/services/accounting-periods.service';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/contexts/I18nContext';
import { getErrorMessage, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  Edit2,
  Loader2,
  Trash2,
  AlertCircle,
  Lock,
  Unlock,
} from 'lucide-react';

export default function AccountingPeriodDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const periodId = Number(params.id);

  const [period, setPeriod] = useState<AccountingPeriod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPeriod();
  }, [periodId]);

  const loadPeriod = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await accountingPeriodsService.getById(periodId);
      setPeriod(response.data);
    } catch (err) {
      console.error('Error loading period:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/accounting-periods?edit=${periodId}`);
  };

  const handleDelete = async () => {
    if (!period) return;
    if (!confirm(t('periods.deleteConfirm.description'))) {
      return;
    }

    try {
      await accountingPeriodsService.delete(period.id);
      router.push('/accounting-periods');
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleClose = async () => {
    if (!period) return;
    if (!confirm(t('periods.closeConfirm.description'))) {
      return;
    }

    try {
      await accountingPeriodsService.closePeriod(period.id);
      await loadPeriod();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleReopen = async () => {
    if (!period) return;
    if (!confirm(t('periods.reopenConfirm.description'))) {
      return;
    }

    try {
      await accountingPeriodsService.reopenPeriod(period.id);
      await loadPeriod();
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
            <p className="text-sm font-medium text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !period) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 px-6">
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">{t('periods.messages.loadError')}</h3>
                <p className="text-sm text-red-700 mt-0.5">
                  {error || t('periods.notFound')}
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => router.push('/accounting-periods')} variant="outline">
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
              onClick={() => router.push('/accounting-periods')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            <span className="text-gray-400">/</span>
            <span className="text-sm text-gray-600">{t('periods.title')}</span>
            <span className="text-gray-400">/</span>
            <span className="text-sm font-medium text-gray-900">
              {period.fiscalYear} {period.type === 'MONTH' && period.month ? `- ${t(`periods.months.${['January','February','March','April','May','June','July','August','September','October','November','December'][period.month - 1]}`)}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!period.closed && (
              <>
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit2 className="h-4 w-4 mr-2" />
                  {t('common.edit')}
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 hover:text-orange-700"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {t('periods.actions.close')}
                </Button>
              </>
            )}
            {period.closed && (
              <Button
                onClick={handleReopen}
                variant="outline"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                <Unlock className="h-4 w-4 mr-2" />
                {t('periods.actions.reopen')}
              </Button>
            )}
            <Button
              onClick={handleDelete}
              variant="outline"
              size="sm"
              disabled={period.closed}
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
              <div className={`flex h-16 w-16 items-center justify-center rounded-xl ${
                period.closed ? 'bg-gray-200 text-gray-600' : 'bg-primary/10 text-primary'
              }`}>
                {period.closed ? <Lock className="h-8 w-8" /> : <Calendar className="h-8 w-8" />}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {t('periods.table.fiscalYear')} {period.fiscalYear}
                  </h1>
                  <Badge className={period.type === 'FISCAL_YEAR' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                    {t(`periods.types.${period.type}`)}
                  </Badge>
                </div>
                {period.type === 'MONTH' && period.month && (
                  <p className="text-lg text-gray-700 mb-2">
                    {t(`periods.months.${['January','February','March','April','May','June','July','August','September','October','November','December'][period.month - 1]}`)}
                  </p>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>{formatDate(period.startDate)}</span>
                  <span>-</span>
                  <span>{formatDate(period.endDate)}</span>
                </div>
                {period.economicGroup && (
                  <p className="text-sm text-gray-500 mt-1">
                    {t('periods.table.economicGroup')}: {period.economicGroup.name}
                  </p>
                )}
              </div>
            </div>

            <div>
              {period.closed ? (
                <Badge className="flex items-center gap-1 bg-gray-200 text-gray-700">
                  <Lock className="h-3 w-3" />
                  {t('periods.status.closed')}
                </Badge>
              ) : (
                <Badge variant="success" className="flex items-center gap-1">
                  <Unlock className="h-3 w-3" />
                  {t('periods.status.open')}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Period Information Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('periods.details.generalInformation')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">{t('periods.table.fiscalYear')}</label>
              <p className="mt-1 text-gray-900 text-xl font-bold">{period.fiscalYear}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t('periods.table.type')}</label>
              <p className="mt-1">
                <Badge className={period.type === 'FISCAL_YEAR' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                  {t(`periods.types.${period.type}`)}
                </Badge>
              </p>
            </div>
            {period.type === 'MONTH' && period.month && (
              <div>
                <label className="text-sm font-medium text-gray-700">{t('periods.table.period')}</label>
                <p className="mt-1 text-gray-900">
                  {t(`periods.months.${['January','February','March','April','May','June','July','August','September','October','November','December'][period.month - 1]}`)}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">{t('periods.form.startDateLabel')}</label>
              <p className="mt-1 text-gray-900">{formatDate(period.startDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t('periods.form.endDateLabel')}</label>
              <p className="mt-1 text-gray-900">{formatDate(period.endDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t('periods.table.status')}</label>
              <p className="mt-1">
                {period.closed ? (
                  <span className="text-gray-600 font-medium">{t('periods.status.closed')}</span>
                ) : (
                  <span className="text-green-600 font-medium">{t('periods.status.open')}</span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t('periods.details.journalEntries')}</label>
              <p className="mt-1 text-gray-900 text-xl font-bold">{period._count?.journalEntries || 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {t('periods.details.journalEntriesHint')}
              </p>
            </div>
            {period.economicGroup && (
              <div>
                <label className="text-sm font-medium text-gray-700">{t('periods.table.economicGroup')}</label>
                <p className="mt-1 text-gray-900">
                  <button
                    onClick={() => router.push(`/economic-groups/${period.economicGroup!.id}`)}
                    className="text-primary hover:underline font-medium"
                  >
                    {period.economicGroup.name}
                  </button>
                </p>
              </div>
            )}
            {period.closed && period.closedByUser && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('periods.table.closedBy')}</label>
                  <p className="mt-1 text-gray-900">{period.closedByUser.name}</p>
                  <p className="text-xs text-gray-500">{period.closedByUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('periods.details.closedAt')}</label>
                  <p className="mt-1 text-gray-900">{formatDate(period.closedAt!)}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
