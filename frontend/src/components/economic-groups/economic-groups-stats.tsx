'use client';

import type { EconomicGroup } from '@/types/economic-group';
import { Building2, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/contexts/I18nContext';

interface EconomicGroupsStatsProps {
  groups: EconomicGroup[];
}

export function EconomicGroupsStats({ groups }: EconomicGroupsStatsProps) {
  const { t } = useTranslation();
  const totalGroups = groups.length;
  const activeGroups = groups.filter((g) => g.active).length;
  const inactiveGroups = totalGroups - activeGroups;
  const totalCompanies = groups.reduce((sum, g) => sum + (g._count?.companies || 0), 0);

  const stats = [
    {
      label: t('grupos.stats.totalGroups'),
      value: totalGroups,
      icon: Building2,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      trend: null,
    },
    {
      label: t('grupos.stats.activeGroups'),
      value: activeGroups,
      icon: CheckCircle2,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: totalGroups > 0 ? Math.round((activeGroups / totalGroups) * 100) : 0,
    },
    {
      label: t('grupos.stats.inactiveGroups'),
      value: inactiveGroups,
      icon: XCircle,
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-500',
      trend: null,
    },
    {
      label: t('grupos.stats.totalCompanies'),
      value: totalCompanies,
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
