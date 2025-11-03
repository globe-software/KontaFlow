'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, DollarSign, Construction } from 'lucide-react';
import { useTranslation } from '@/contexts/I18nContext';

export default function ExchangeRatesPage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
          <span className="text-gray-400">/</span>
          <h1 className="text-2xl font-bold text-gray-900">{t('navigation.exchangeRates')}</h1>
        </div>

        {/* Coming Soon Message */}
        <div className="flex min-h-[500px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
            <Construction className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('navigation.exchangeRates')} - Coming Soon
          </h2>
          <p className="text-gray-600 text-center max-w-md mb-6">
            This module is currently under development. The backend API is ready, but the frontend interface is still being built.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <DollarSign className="h-4 w-4" />
            <span>API endpoints available at /api/exchange-rates</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
