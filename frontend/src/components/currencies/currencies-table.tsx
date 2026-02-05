'use client';

import { useTranslation } from '@/contexts/I18nContext';
import type { Currency } from '@/types/currency';
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
import { DollarSign, Edit2, MoreHorizontal, Trash2, CheckCircle2, XCircle, Star } from 'lucide-react';

interface CurrenciesTableProps {
  currencies: Currency[];
  onEdit: (currency: Currency) => void;
  onDelete: (currency: Currency) => void;
}

export function CurrenciesTable({ currencies, onEdit, onDelete }: CurrenciesTableProps) {
  const { t } = useTranslation();

  if (currencies.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 p-12">
        <DollarSign className="mb-4 h-16 w-16 text-gray-300" />
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          {t('currencies.emptyState')}
        </h3>
        <p className="mb-6 max-w-sm text-center text-sm text-gray-500">
          {t('currencies.emptyStateDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-gray-50/50">
            <TableHead className="font-semibold">{t('currencies.table.code')}</TableHead>
            <TableHead className="font-semibold">{t('currencies.table.name')}</TableHead>
            <TableHead className="font-semibold">{t('currencies.table.symbol')}</TableHead>
            <TableHead className="font-semibold">{t('currencies.table.decimals')}</TableHead>
            <TableHead className="font-semibold">{t('currencies.table.status')}</TableHead>
            <TableHead className="font-semibold">{t('currencies.table.default')}</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currencies.map((currency, index) => (
            <TableRow
              key={currency.code}
              className={`group transition-colors hover:bg-primary/5 ${
                index % 2 === 0 ? 'bg-white' : 'bg-primary/3'
              } ${!currency.active ? 'opacity-60' : ''}`}
            >
              <TableCell className="py-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-md ${
                      currency.active
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{currency.code}</span>
                </div>
              </TableCell>
              <TableCell className="py-2 text-sm text-gray-700">{currency.name}</TableCell>
              <TableCell className="py-2">
                <span className="text-sm font-medium text-gray-900">
                  {currency.symbol || '-'}
                </span>
              </TableCell>
              <TableCell className="py-2">
                <Badge variant="outline" className="text-xs">
                  {currency.decimals} {t('currencies.table.decimalPlaces')}
                </Badge>
              </TableCell>
              <TableCell className="py-2">
                {currency.active ? (
                  <Badge
                    variant="success"
                    className="flex w-fit items-center gap-1 px-2 py-0.5 text-xs"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {t('currencies.status.active')}
                  </Badge>
                ) : (
                  <Badge className="flex w-fit items-center gap-1 bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                    <XCircle className="h-3 w-3" />
                    {t('currencies.status.inactive')}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="py-2">
                {currency.isDefaultFunctional && (
                  <Badge
                    variant="default"
                    className="flex w-fit items-center gap-1 bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800"
                  >
                    <Star className="h-3 w-3" />
                    {t('currencies.table.defaultCurrency')}
                  </Badge>
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
                      onClick={() => onEdit(currency)}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      <span>{t('common.edit')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={() => onDelete(currency)}
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
