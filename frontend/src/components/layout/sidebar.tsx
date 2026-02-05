'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Building,
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  BarChart3,
  BookOpen,
  Calendar,
  UserCircle,
  TrendingUp,
  DollarSign,
  Coins,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/I18nContext';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const menuSections = [
    {
      label: null,
      items: [
        {
          label: t('navigation.dashboard'),
          icon: LayoutDashboard,
          href: '/',
        },
      ],
    },
    {
      label: 'Organización',
      items: [
        {
          label: t('navigation.grupos'),
          icon: Building2,
          href: '/economic-groups',
        },
        {
          label: t('navigation.companies'),
          icon: Building,
          href: '/companies',
        },
        {
          label: t('navigation.userCompanies'),
          icon: UserCircle,
          href: '/user-companies',
        },
      ],
    },
    {
      label: 'Terceros',
      items: [
        {
          label: t('navigation.customers'),
          icon: Users,
          href: '/customers',
        },
        {
          label: t('navigation.suppliers'),
          icon: TrendingUp,
          href: '/suppliers',
        },
      ],
    },
    {
      label: 'Plan de Cuentas',
      items: [
        {
          label: t('navigation.accounts'),
          icon: BookOpen,
          href: '/accounts',
        },
        {
          label: t('navigation.periods'),
          icon: Calendar,
          href: '/accounting-periods',
        },
        {
          label: t('navigation.currencies'),
          icon: Coins,
          href: '/currencies',
        },
        {
          label: t('navigation.exchangeRates'),
          icon: DollarSign,
          href: '/exchange-rates',
        },
      ],
    },
    {
      label: 'Contabilidad',
      items: [
        {
          label: t('navigation.comprobantes'),
          icon: FileText,
          href: '/comprobantes',
        },
        {
          label: t('navigation.reportes'),
          icon: BarChart3,
          href: '/reportes',
        },
      ],
    },
    {
      label: null,
      items: [
        {
          label: t('navigation.settings'),
          icon: Settings,
          href: '/configuracion',
        },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col border-r border-gray-200 bg-gray-50',
        className
      )}
    >
      <nav className="flex-1 space-y-4 p-4">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.label && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.label}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <p className="text-xs text-gray-500">
          KontaFlow v1.0.0
          <br />
          © 2025 Globe Software
        </p>
      </div>
    </aside>
  );
}
