'use client';

import type { Customer } from '@/types/customer';
import { Users, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/contexts/I18nContext';

interface CustomersStatsProps {
  customers: Customer[];
}

export function CustomersStats({ customers }: CustomersStatsProps) {
  const { t } = useTranslation();
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.active).length;
  const inactiveCustomers = totalCustomers - activeCustomers;
  const withEmail = customers.filter((c) => c.email).length;

  const stats = [
    {
      label: t('customers.stats.total'),
      value: totalCustomers,
      icon: Users,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      trend: null,
    },
    {
      label: t('customers.stats.active'),
      value: activeCustomers,
      icon: CheckCircle2,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0,
    },
    {
      label: t('customers.stats.inactive'),
      value: inactiveCustomers,
      icon: XCircle,
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-500',
      trend: null,
    },
    {
      label: t('customers.stats.withEmail'),
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
