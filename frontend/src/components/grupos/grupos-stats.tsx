import type { GrupoEconomico } from '@/types/grupo';
import { Building2, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

interface GruposStatsProps {
  grupos: GrupoEconomico[];
}

export function GruposStats({ grupos }: GruposStatsProps) {
  const totalGrupos = grupos.length;
  const gruposActivos = grupos.filter((g) => g.activo).length;
  const gruposInactivos = totalGrupos - gruposActivos;
  const totalEmpresas = grupos.reduce((sum, g) => sum + (g._count?.empresas || 0), 0);

  const stats = [
    {
      label: 'Total Grupos',
      value: totalGrupos,
      icon: Building2,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      trend: null,
    },
    {
      label: 'Grupos Activos',
      value: gruposActivos,
      icon: CheckCircle2,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: totalGrupos > 0 ? Math.round((gruposActivos / totalGrupos) * 100) : 0,
    },
    {
      label: 'Grupos Inactivos',
      value: gruposInactivos,
      icon: XCircle,
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-500',
      trend: null,
    },
    {
      label: 'Total Empresas',
      value: totalEmpresas,
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
