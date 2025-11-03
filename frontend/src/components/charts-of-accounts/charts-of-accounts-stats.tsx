'use client';

import type { ChartOfAccounts } from '@/types/chart-of-accounts';
import { FileText, FolderTree, CheckCircle2, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/contexts/I18nContext';

interface ChartsOfAccountsStatsProps {
  charts: ChartOfAccounts[];
}

export function ChartsOfAccountsStats({ charts }: ChartsOfAccountsStatsProps) {
  const { t } = useTranslation();

  const totalCharts = charts.length;
  const activeCharts = charts.filter((c) => c.active).length;
  const totalAccounts = charts.reduce((sum, c) => sum + (c._count?.accounts || 0), 0);
  const avgAccountsPerChart = totalCharts > 0 ? Math.round(totalAccounts / totalCharts) : 0;

  const stats = [
    {
      label: t('chartsOfAccounts.stats.totalCharts'),
      value: totalCharts,
      icon: FileText,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      trend: null,
    },
    {
      label: t('chartsOfAccounts.stats.activeCharts'),
      value: activeCharts,
      icon: CheckCircle2,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: totalCharts > 0 ? Math.round((activeCharts / totalCharts) * 100) : 0,
    },
    {
      label: t('chartsOfAccounts.stats.totalAccounts'),
      value: totalAccounts,
      icon: FolderTree,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trend: null,
    },
    {
      label: t('chartsOfAccounts.stats.avgAccounts'),
      value: avgAccountsPerChart,
      icon: TrendingUp,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
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
