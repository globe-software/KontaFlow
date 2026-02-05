'use client';

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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { ExchangeRate } from '@/types/exchange-rate';

interface ExchangeRatesTableProps {
  exchangeRates: ExchangeRate[];
  onEdit: (exchangeRate: ExchangeRate) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export function ExchangeRatesTable({
  exchangeRates,
  onEdit,
  onDelete,
  isLoading,
}: ExchangeRatesTableProps) {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatRate = (rate: number) => {
    return rate.toFixed(4);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (exchangeRates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">No exchange rates found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('exchangeRates.table.date')}</TableHead>
            <TableHead>Currency Pair</TableHead>
            <TableHead className="text-right">{t('exchangeRates.table.purchaseRate')}</TableHead>
            <TableHead className="text-right">{t('exchangeRates.table.averageRate')}</TableHead>
            <TableHead className="text-right">{t('exchangeRates.table.saleRate')}</TableHead>
            <TableHead>{t('exchangeRates.table.source')}</TableHead>
            <TableHead>{t('exchangeRates.table.createdAt')}</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exchangeRates.map((exchangeRate) => (
            <TableRow key={exchangeRate.id}>
              <TableCell className="font-medium">
                {formatDate(exchangeRate.date)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{exchangeRate.sourceCurrency}</Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="outline">{exchangeRate.targetCurrency}</Badge>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatRate(exchangeRate.purchaseRate)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatRate(exchangeRate.averageRate)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatRate(exchangeRate.saleRate)}
              </TableCell>
              <TableCell>
                {exchangeRate.source ? (
                  <span className="text-sm">{exchangeRate.source}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDateTime(exchangeRate.createdAt)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(exchangeRate)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(exchangeRate.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
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
