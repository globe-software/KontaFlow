'use client';

import type { Company } from '@/types/company';
import { Building, CheckCircle2, XCircle, Globe } from 'lucide-react';
import { useTranslation } from '@/contexts/I18nContext';
import { PAISES } from '@/lib/config';

interface CompaniesStatsProps {
  companies: Company[];
}

export function CompaniesStats({ companies }: CompaniesStatsProps) {
  const { t } = useTranslation();
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter((c) => c.active).length;
  const inactiveCompanies = totalCompanies - activeCompanies;

  // Count companies by country
  const countryCounts: Record<string, number> = {};
  companies.forEach((c) => {
    countryCounts[c.country] = (countryCounts[c.country] || 0) + 1;
  });
  const topCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0];

  const stats = [
    {
      label: t('companies.stats.totalCompanies'),
      value: totalCompanies,
      icon: Building,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      trend: null,
    },
    {
      label: t('companies.stats.activeCompanies'),
      value: activeCompanies,
      icon: CheckCircle2,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: totalCompanies > 0 ? Math.round((activeCompanies / totalCompanies) * 100) : 0,
    },
    {
      label: t('companies.stats.inactiveCompanies'),
      value: inactiveCompanies,
      icon: XCircle,
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-500',
      trend: null,
    },
    {
      label: t('companies.stats.topCountry'),
      value: topCountry ? `${PAISES[topCountry[0] as keyof typeof PAISES]} (${topCountry[1]})` : '-',
      icon: Globe,
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
                  {stat.isText ? (
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      {stat.trend !== null && (
                        <span className="text-sm font-medium text-green-600">
                          {stat.trend}%
                        </span>
                      )}
                    </>
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
