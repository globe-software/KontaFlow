'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  BarChart3,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/I18nContext';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const menuItems = [
    {
      label: t('navigation.dashboard'),
      icon: LayoutDashboard,
      href: '/',
    },
    {
      label: t('navigation.grupos'),
      icon: Building2,
      href: '/grupos',
    },
    {
      label: t('navigation.empresas'),
      icon: Users,
      href: '/empresas',
    },
    {
      label: t('navigation.comprobantes'),
      icon: FileText,
      href: '/comprobantes',
    },
    {
      label: t('navigation.cuentas'),
      icon: Wallet,
      href: '/cuentas',
    },
    {
      label: t('navigation.reportes'),
      icon: BarChart3,
      href: '/reportes',
    },
    {
      label: t('navigation.settings'),
      icon: Settings,
      href: '/configuracion',
    },
  ];

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col border-r border-gray-200 bg-gray-50',
        className
      )}
    >
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
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
