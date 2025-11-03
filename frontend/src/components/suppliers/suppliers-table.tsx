'use client';

import { useRouter } from 'next/navigation';
import type { Supplier } from '@/types/supplier';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import {
  Users,
  Calendar,
  CheckCircle2,
  Edit2,
  FileText,
  MoreHorizontal,
  Trash2,
  XCircle,
  Mail,
  Phone,
} from 'lucide-react';

interface SuppliersTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export function SuppliersTable({ suppliers, onEdit, onDelete }: SuppliersTableProps) {
  const router = useRouter();
  const { t } = useTranslation();

  if (suppliers.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 p-12">
        <Users className="mb-4 h-16 w-16 text-gray-300" />
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          {t('suppliers.emptyState')}
        </h3>
        <p className="mb-6 max-w-sm text-center text-sm text-gray-500">
          {t('suppliers.emptyStateDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-gray-50/50">
            <TableHead className="font-semibold">{t('suppliers.table.name')}</TableHead>
            <TableHead className="font-semibold">{t('suppliers.table.rut')}</TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                <span>{t('suppliers.table.email')}</span>
              </div>
            </TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                <span>{t('suppliers.table.phone')}</span>
              </div>
            </TableHead>
            <TableHead className="font-semibold">{t('suppliers.table.status')}</TableHead>
            <TableHead className="font-semibold">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{t('suppliers.table.createdAt')}</span>
              </div>
            </TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier, index) => (
            <TableRow
              key={supplier.id}
              className={`group transition-colors hover:bg-primary/5 ${
                index % 2 === 0 ? 'bg-white' : 'bg-primary/3'
              }`}
            >
              <TableCell className="py-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{supplier.name}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2 text-sm text-gray-700">
                {supplier.rut || '-'}
              </TableCell>
              <TableCell className="py-2 text-sm text-gray-700">
                {supplier.email || '-'}
              </TableCell>
              <TableCell className="py-2 text-sm text-gray-700">
                {supplier.phone || '-'}
              </TableCell>
              <TableCell className="py-2">
                {supplier.active ? (
                  <Badge
                    variant="success"
                    className="flex w-fit items-center gap-1 px-2 py-0.5 text-xs"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {t('common.active')}
                  </Badge>
                ) : (
                  <Badge className="flex w-fit items-center gap-1 bg-gray-100 px-2 py-0.5 text-xs text-gray-700 hover:bg-gray-100/80">
                    <XCircle className="h-3 w-3" />
                    {t('common.inactive')}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="py-2 text-xs text-gray-600">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">
                        {formatRelativeTime(supplier.createdAt)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{formatDate(supplier.createdAt)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                      onClick={() => onEdit(supplier)}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      <span>{t('common.edit')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => router.push(`/suppliers/${supplier.id}`)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('common.details')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={() => onDelete(supplier)}
                      disabled={!supplier.active}
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
