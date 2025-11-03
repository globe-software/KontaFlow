'use client';

import type { UserCompany } from '@/types/user-company';
import { useTranslation } from '@/contexts/I18nContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, Building2, Edit2, MoreHorizontal, Trash2, ShieldCheck, Eye } from 'lucide-react';

interface UserCompaniesTableProps {
  permissions: UserCompany[];
  onToggleWrite: (permission: UserCompany) => void;
  onDelete: (permission: UserCompany) => void;
}

export function UserCompaniesTable({ permissions, onToggleWrite, onDelete }: UserCompaniesTableProps) {
  const { t } = useTranslation();

  if (permissions.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 p-12">
        <ShieldCheck className="mb-4 h-16 w-16 text-gray-300" />
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          {t('userCompanies.emptyState')}
        </h3>
        <p className="mb-6 max-w-sm text-center text-sm text-gray-500">
          {t('userCompanies.emptyStateDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-gray-50/50">
            <TableHead className="font-semibold">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{t('userCompanies.table.user')}</span>
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                <span>{t('userCompanies.table.company')}</span>
              </div>
            </TableHead>
            <TableHead className="font-semibold">{t('userCompanies.table.permissions')}</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map((permission, index) => (
            <TableRow
              key={`${permission.userId}-${permission.companyId}`}
              className={`group transition-colors hover:bg-primary/5 ${
                index % 2 === 0 ? 'bg-white' : 'bg-primary/3'
              }`}
            >
              <TableCell className="py-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{permission.user.name}</p>
                    <p className="text-xs text-gray-500">{permission.user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{permission.company.name}</p>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={permission.canWrite}
                    onCheckedChange={() => onToggleWrite(permission)}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {permission.canWrite ? t('userCompanies.permissions.write') : t('userCompanies.permissions.read')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {permission.canWrite ? t('userCompanies.permissions.writeDescription') : t('userCompanies.permissions.readDescription')}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                      <span className="sr-only">{t('common.actions')}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => onToggleWrite(permission)}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      <span>{t('userCompanies.actions.togglePermission')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={() => onDelete(permission)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>{t('common.delete')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
