'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Company } from '@/types/company';
import { companiesService } from '@/services/companies.service';
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
import { getErrorMessage, formatDate } from '@/lib/utils';
import { PAISES, MONEDAS } from '@/lib/config';
import {
  ArrowLeft,
  Building,
  CheckCircle2,
  Edit2,
  Loader2,
  FileText,
  Trash2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const companyId = Number(params.id);

  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCompany();
  }, [companyId]);

  const loadCompany = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await companiesService.getById(companyId);
      setCompany(response.data);
    } catch (err) {
      console.error('Error loading company:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    // Navigate to list with query param to open edit modal
    router.push(`/companies?edit=${companyId}`);
  };

  const handleDelete = async () => {
    if (!company) return;
    if (!confirm(t('companies.deleteConfirm.description'))) {
      return;
    }

    try {
      await companiesService.delete(company.id);
      router.push('/companies');
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

  if (error || !company) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 px-6">
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">{t('companies.messages.loadError')}</h3>
                <p className="text-sm text-red-700 mt-0.5">
                  {error || t('companies.notFound')}
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => router.push('/companies')} variant="outline">
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
              onClick={() => router.push('/companies')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            <span className="text-gray-400">/</span>
            <span className="text-sm text-gray-600">{t('companies.title')}</span>
            <span className="text-gray-400">/</span>
            <span className="text-sm font-medium text-gray-900">{company.name}</span>
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
              disabled={!company.active}
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
                <Building className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {company.name}
                </h1>
                {company.tradeName && (
                  <p className="text-sm text-gray-600 mb-1">
                    {t('companies.table.tradeName')}: {company.tradeName}
                  </p>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="font-mono">{company.rut}</span>
                  <span>•</span>
                  <span>{PAISES[company.country as keyof typeof PAISES]}</span>
                  <span>•</span>
                  <span>
                    {company.functionalCurrency} ({MONEDAS[company.functionalCurrency as keyof typeof MONEDAS]})
                  </span>
                </div>
                {company.economicGroup && (
                  <p className="text-sm text-gray-500 mt-1">
                    {t('companies.table.economicGroup')}:{' '}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/economic-groups/${company.economicGroup!.id}`);
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      {company.economicGroup.name}
                    </button>
                  </p>
                )}
              </div>
            </div>

            <div>
              {company.active ? (
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
              <Building className="h-4 w-4 mr-2" />
              {t('companies.details.information')}
            </TabsTrigger>
            <TabsTrigger value="entries">
              <FileText className="h-4 w-4 mr-2" />
              {t('companies.details.journalEntries')} ({company._count?.journalEntries || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('companies.details.generalInformation')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('companies.table.name')}</label>
                  <p className="mt-1 text-gray-900">{company.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('companies.table.tradeName')}</label>
                  <p className="mt-1 text-gray-900">{company.tradeName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('companies.table.rut')}</label>
                  <p className="mt-1 text-gray-900 font-mono">{company.rut}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('companies.table.country')}</label>
                  <p className="mt-1 text-gray-900">{PAISES[company.country as keyof typeof PAISES]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('companies.table.currency')}</label>
                  <p className="mt-1 text-gray-900">
                    {company.functionalCurrency} - {MONEDAS[company.functionalCurrency as keyof typeof MONEDAS]}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('companies.table.economicGroup')}</label>
                  <p className="mt-1 text-gray-900">
                    {company.economicGroup ? (
                      <button
                        onClick={() => router.push(`/economic-groups/${company.economicGroup!.id}`)}
                        className="text-primary hover:underline font-medium"
                      >
                        {company.economicGroup.name}
                      </button>
                    ) : (
                      '-'
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('companies.form.startDateLabel')}</label>
                  <p className="mt-1 text-gray-900">
                    {company.startDate ? formatDate(company.startDate) : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">{t('companies.table.status')}</label>
                  <p className="mt-1">
                    {company.active ? (
                      <span className="text-green-600 font-medium">{t('common.active')}</span>
                    ) : (
                      <span className="text-gray-600 font-medium">{t('common.inactive')}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="entries">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('companies.details.journalEntries')}
                </h3>
              </div>
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>{t('companies.details.noJournalEntries')}</p>
                <p className="text-sm mt-1">
                  {t('companies.details.journalEntriesDescription')}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
