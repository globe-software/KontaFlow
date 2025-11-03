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

const menuItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    label: 'Grupos Económicos',
    icon: Building2,
    href: '/grupos',
  },
  {
    label: 'Empresas',
    icon: Users,
    href: '/empresas',
  },
  {
    label: 'Comprobantes',
    icon: FileText,
    href: '/comprobantes',
  },
  {
    label: 'Cuentas',
    icon: Wallet,
    href: '/cuentas',
  },
  {
    label: 'Reportes',
    icon: BarChart3,
    href: '/reportes',
  },
  {
    label: 'Configuración',
    icon: Settings,
    href: '/configuracion',
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

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
