'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from '@/contexts/I18nContext';
import type { Customer } from '@/types/customer';
import { customersService } from '@/services/customers.service';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getErrorMessage } from '@/lib/utils';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileText,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  Building2,
} from 'lucide-react';

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const customerId = Number(params.id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomer();
  }, [customerId]);

  const loadCustomer = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await customersService.getById(customerId);
      setCustomer(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/customers?edit=${customerId}`);
  };

  const handleDelete = async () => {
    if (!customer) return;

    if (!confirm(t('customers.deleteConfirm.description'))) {
      return;
    }

    try {
      await customersService.delete(customerId);
      router.push('/customers');
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-UY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  if (error || !customer) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 px-6">
          <div className="mb-6">
            <Button onClick={() => router.push('/customers')} variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">
                  {t('customers.messages.loadError')}
                </h3>
                <p className="text-sm text-red-700 mt-0.5">
                  {error || t('customers.messages.notFound')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button onClick={() => router.push('/customers')} variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            <span className="text-gray-400">/</span>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            {customer.active ? (
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
          <div className="flex gap-2">
            <Button onClick={handleEdit} variant="outline" size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              {t('common.edit')}
            </Button>
            <Button onClick={handleDelete} variant="outline" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              {t('common.delete')}
            </Button>
          </div>
        </div>

        {/* Customer Information Card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {t('customers.details.information')}
            </h2>
          </div>
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  {t('customers.form.nameLabel')}
                </label>
                <p className="mt-1 text-base text-gray-900">{customer.name}</p>
              </div>

              {/* RUT */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  {t('customers.form.rutLabel')}
                </label>
                <p className="mt-1 text-base text-gray-900">{customer.rut || '-'}</p>
              </div>

              {/* Email */}
              {customer.email && (
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {t('customers.form.emailLabel')}
                  </label>
                  <a
                    href={`mailto:${customer.email}`}
                    className="mt-1 text-base text-primary hover:underline"
                  >
                    {customer.email}
                  </a>
                </div>
              )}

              {/* Phone */}
              {customer.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {t('customers.form.phoneLabel')}
                  </label>
                  <a
                    href={`tel:${customer.phone}`}
                    className="mt-1 text-base text-primary hover:underline"
                  >
                    {customer.phone}
                  </a>
                </div>
              )}

              {/* Address */}
              {customer.address && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {t('customers.form.addressLabel')}
                  </label>
                  <p className="mt-1 text-base text-gray-900">{customer.address}</p>
                </div>
              )}

              {/* Created At */}
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {t('customers.table.createdAt')}
                </label>
                <p className="mt-1 text-base text-gray-900">{formatDate(customer.createdAt)}</p>
              </div>

              {/* Economic Group */}
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {t('customers.form.economicGroupLabel')}
                </label>
                <p className="mt-1 text-base text-gray-900">ID: {customer.economicGroupId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Future sections can be added here */}
        {/* Example: Transaction history, Account balance, etc. */}
        <div className="mt-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {t('customers.details.transactionsTitle')}
          </h3>
          <p className="text-sm text-gray-600">
            {t('customers.details.transactionsComingSoon')}
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
