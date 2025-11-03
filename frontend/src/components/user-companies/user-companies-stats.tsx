'use client';

import type { UserCompany } from '@/types/user-company';
import { Users, Building2, ShieldCheck, Share2 } from 'lucide-react';
import { useTranslation } from '@/contexts/I18nContext';

interface UserCompaniesStatsProps {
  permissions: UserCompany[];
}

export function UserCompaniesStats({ permissions }: UserCompaniesStatsProps) {
  const { t } = useTranslation();

  const totalPermissions = permissions.length;
  const writePermissions = permissions.filter((p) => p.canWrite).length;
  const uniqueUsers = new Set(permissions.map((p) => p.userId)).size;
  const uniqueCompanies = new Set(permissions.map((p) => p.companyId)).size;

  const stats = [
    {
      label: t('userCompanies.stats.totalPermissions'),
      value: totalPermissions,
      icon: ShieldCheck,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      trend: null,
    },
    {
      label: t('userCompanies.stats.usersWithAccess'),
      value: uniqueUsers,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trend: null,
    },
    {
      label: t('userCompanies.stats.companiesShared'),
      value: uniqueCompanies,
      icon: Building2,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: null,
    },
    {
      label: t('userCompanies.stats.writeAccess'),
      value: writePermissions,
      icon: Share2,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      trend: totalPermissions > 0 ? Math.round((writePermissions / totalPermissions) * 100) : 0,
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
                    <span className="text-sm font-medium text-orange-600">
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
