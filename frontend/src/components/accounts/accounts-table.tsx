'use client';

import { useRouter } from 'next/navigation';
import type { Account } from '@/types/account';
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
  FileText,
  CheckCircle2,
  Edit2,
  MoreHorizontal,
  Trash2,
  XCircle,
} from 'lucide-react';

interface AccountsTableProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export function AccountsTable({ accounts, onEdit, onDelete }: AccountsTableProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ASSET':
        return 'bg-blue-100 text-blue-700';
      case 'LIABILITY':
        return 'bg-red-100 text-red-700';
      case 'EQUITY':
        return 'bg-purple-100 text-purple-700';
      case 'INCOME':
        return 'bg-green-100 text-green-700';
      case 'EXPENSE':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 p-12">
        <FileText className="mb-4 h-16 w-16 text-gray-300" />
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          {t('accounts.emptyState')}
        </h3>
        <p className="mb-6 max-w-sm text-center text-sm text-gray-500">
          {t('accounts.emptyStateDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-gray-50/50">
            <TableHead className="font-semibold">{t('accounts.table.code')}</TableHead>
            <TableHead className="font-semibold">{t('accounts.table.name')}</TableHead>
            <TableHead className="font-semibold">{t('accounts.table.type')}</TableHead>
            <TableHead className="font-semibold">{t('accounts.table.level')}</TableHead>
            <TableHead className="font-semibold">{t('accounts.table.postable')}</TableHead>
            <TableHead className="font-semibold">{t('accounts.table.currency')}</TableHead>
            <TableHead className="font-semibold">{t('accounts.table.status')}</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account, index) => (
            <TableRow
              key={account.id}
              className={`group transition-colors hover:bg-primary/5 ${
                index % 2 === 0 ? 'bg-white' : 'bg-primary/3'
              }`}
            >
              <TableCell className="py-2">
                <span className="text-sm font-mono font-medium text-gray-900">
                  {account.code}
                </span>
              </TableCell>
              <TableCell className="py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900">{account.name}</span>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <Badge className={`text-xs ${getTypeColor(account.type)}`}>
                  {t(`accounts.types.${account.type}`)}
                </Badge>
              </TableCell>
              <TableCell className="py-2">
                <div className="flex items-center gap-1.5">
                  <div className="flex h-6 min-w-[1.5rem] items-center justify-center rounded bg-gray-100 px-1.5">
                    <span className="text-xs font-bold text-gray-700">
                      {account.level}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                {account.postable ? (
                  <Badge className="flex w-fit items-center gap-1 bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    <CheckCircle2 className="h-3 w-3" />
                    {t('common.yes')}
                  </Badge>
                ) : (
                  <Badge className="flex w-fit items-center gap-1 bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                    <XCircle className="h-3 w-3" />
                    {t('common.no')}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="py-2 text-sm text-gray-700">
                {account.currency}
              </TableCell>
              <TableCell className="py-2">
                {account.active ? (
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
                      onClick={() => onEdit(account)}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      <span>{t('common.edit')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => router.push(`/accounts/${account.id}`)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('common.details')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={() => onDelete(account)}
                      disabled={!account.active}
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
