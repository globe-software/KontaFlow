'use client';

import { useRouter } from 'next/navigation';
import type { AccountingPeriod } from '@/types/accounting-period';
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
import { formatDate } from '@/lib/utils';
import {
  Calendar,
  CheckCircle2,
  Edit2,
  FileText,
  Lock,
  Unlock,
  MoreHorizontal,
  Trash2,
  XCircle,
} from 'lucide-react';

interface PeriodsTableProps {
  periods: AccountingPeriod[];
  onEdit: (period: AccountingPeriod) => void;
  onDelete: (period: AccountingPeriod) => void;
  onClose: (period: AccountingPeriod) => void;
  onReopen: (period: AccountingPeriod) => void;
}

export function PeriodsTable({ periods, onEdit, onDelete, onClose, onReopen }: PeriodsTableProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (periods.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 p-12">
        <Calendar className="mb-4 h-16 w-16 text-gray-300" />
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          {t('periods.emptyState')}
        </h3>
        <p className="mb-6 max-w-sm text-center text-sm text-gray-500">
          {t('periods.emptyStateDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-gray-50/50">
            <TableHead className="font-semibold">{t('periods.table.fiscalYear')}</TableHead>
            <TableHead className="font-semibold">{t('periods.table.type')}</TableHead>
            <TableHead className="font-semibold">{t('periods.table.period')}</TableHead>
            <TableHead className="font-semibold">{t('periods.table.dateRange')}</TableHead>
            <TableHead className="font-semibold">{t('periods.table.status')}</TableHead>
            <TableHead className="font-semibold">{t('periods.table.closedBy')}</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {periods.map((period, index) => (
            <TableRow
              key={period.id}
              className={`group transition-colors hover:bg-primary/5 ${
                index % 2 === 0 ? 'bg-white' : 'bg-primary/3'
              } ${period.closed ? 'opacity-75' : ''}`}
            >
              <TableCell className="py-2">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-md ${
                    period.closed ? 'bg-gray-200 text-gray-600' : 'bg-primary/10 text-primary'
                  }`}>
                    {period.closed ? <Lock className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                  </div>
                  <span className="text-sm font-bold text-gray-900">{period.fiscalYear}</span>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <Badge className={period.type === 'FISCAL_YEAR' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                  {t(`periods.types.${period.type}`)}
                </Badge>
              </TableCell>
              <TableCell className="py-2 text-sm text-gray-700">
                {period.type === 'MONTH' && period.month
                  ? t(`periods.months.${MONTHS[period.month - 1]}`)
                  : '-'}
              </TableCell>
              <TableCell className="py-2">
                <div className="text-sm text-gray-700">
                  <div>{formatDate(period.startDate)}</div>
                  <div className="text-xs text-gray-500">
                    {t('periods.to')} {formatDate(period.endDate)}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                {period.closed ? (
                  <Badge className="flex w-fit items-center gap-1 bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                    <Lock className="h-3 w-3" />
                    {t('periods.status.closed')}
                  </Badge>
                ) : (
                  <Badge
                    variant="success"
                    className="flex w-fit items-center gap-1 px-2 py-0.5 text-xs"
                  >
                    <Unlock className="h-3 w-3" />
                    {t('periods.status.open')}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="py-2">
                {period.closed && period.closedByUser ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-xs text-gray-600">
                          <div className="font-medium">{period.closedByUser.name}</div>
                          <div className="text-gray-500">{formatDate(period.closedAt!)}</div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{period.closedByUser.email}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
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
                      onClick={() => router.push(`/accounting-periods/${period.id}`)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('common.details')}</span>
                    </DropdownMenuItem>
                    {!period.closed && (
                      <>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => onEdit(period)}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          <span>{t('common.edit')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer text-orange-600 focus:text-orange-600"
                          onClick={() => onClose(period)}
                        >
                          <Lock className="mr-2 h-4 w-4" />
                          <span>{t('periods.actions.close')}</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    {period.closed && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer text-blue-600 focus:text-blue-600"
                          onClick={() => onReopen(period)}
                        >
                          <Unlock className="mr-2 h-4 w-4" />
                          <span>{t('periods.actions.reopen')}</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={() => onDelete(period)}
                      disabled={period.closed}
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
