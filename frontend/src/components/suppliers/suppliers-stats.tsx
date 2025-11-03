'use client';

import type { Supplier } from '@/types/supplier';
import { Users, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/contexts/I18nContext';

interface SuppliersStatsProps {
  suppliers: Supplier[];
}

export function SuppliersStats({ suppliers }: SuppliersStatsProps) {
  const { t } = useTranslation();
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.active).length;
  const inactiveSuppliers = totalSuppliers - activeSuppliers;
  const withEmail = suppliers.filter((s) => s.email).length;

  const stats = [
    {
      label: t('suppliers.stats.total'),
      value: totalSuppliers,
      icon: Users,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      trend: null,
    },
    {
      label: t('suppliers.stats.active'),
      value: activeSuppliers,
      icon: CheckCircle2,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: totalSuppliers > 0 ? Math.round((activeSuppliers / totalSuppliers) * 100) : 0,
    },
    {
      label: t('suppliers.stats.inactive'),
      value: inactiveSuppliers,
      icon: XCircle,
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-500',
      trend: null,
    },
    {
      label: t('suppliers.stats.withEmail'),
      value: withEmail,
      icon: TrendingUp,
      bgColor: 'bg-accent',
      iconColor: 'text-accent-foreground',
      trend: null,
    },
  ];

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  {stat.trend !== null && (
                    <span className="text-sm font-medium text-green-600">
                      {stat.trend}%
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}
              >
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
