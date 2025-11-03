'use client';

import type { AccountingPeriod } from '@/types/accounting-period';
import { Calendar, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/contexts/I18nContext';

interface PeriodsStatsProps {
  periods: AccountingPeriod[];
}

export function PeriodsStats({ periods }: PeriodsStatsProps) {
  const { t } = useTranslation();
  const totalPeriods = periods.length;
  const openPeriods = periods.filter((p) => !p.closed).length;
  const closedPeriods = totalPeriods - openPeriods;

  // Get current fiscal year (most recent)
  const currentYear = periods.length > 0
    ? Math.max(...periods.map(p => p.fiscalYear))
    : new Date().getFullYear();

  const stats = [
    {
      label: t('periods.stats.totalPeriods'),
      value: totalPeriods,
      icon: Calendar,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      trend: null,
    },
    {
      label: t('periods.stats.openPeriods'),
      value: openPeriods,
      icon: CheckCircle2,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: null,
    },
    {
      label: t('periods.stats.closedPeriods'),
      value: closedPeriods,
      icon: XCircle,
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-500',
      trend: null,
    },
    {
      label: t('periods.stats.currentYear'),
      value: currentYear,
      icon: TrendingUp,
      bgColor: 'bg-accent',
      iconColor: 'text-accent-foreground',
      trend: null,
      isText: true,
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
