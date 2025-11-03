'use client';

import { useState } from 'react';
import type { Account } from '@/types/account';
import { useTranslation } from '@/contexts/I18nContext';
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
  ChevronDown,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  MoreHorizontal,
  FileText,
  CheckCircle2,
} from 'lucide-react';

interface AccountsTreeProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onAddChild: (parent: Account) => void;
}

interface TreeNodeProps {
  account: Account;
  level: number;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onAddChild: (parent: Account) => void;
}

function TreeNode({ account, level, onEdit, onDelete, onAddChild }: TreeNodeProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const hasChildren = account.subaccounts && account.subaccounts.length > 0;

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

  return (
    <div>
      <div
        className="group flex items-center py-2 px-3 hover:bg-primary/5 rounded-md transition-colors"
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {/* Expand/collapse button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`mr-2 h-5 w-5 flex items-center justify-center rounded hover:bg-gray-200 ${
            !hasChildren ? 'invisible' : ''
          }`}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          )}
        </button>

        {/* Account code */}
        <span className="font-mono text-sm font-medium text-gray-900 min-w-[100px]">
          {account.code}
        </span>

        {/* Account name */}
        <span className="text-sm text-gray-900 flex-1 mx-3">{account.name}</span>

        {/* Type badge - fixed width for alignment */}
        <div className="w-[100px] mr-2">
          <Badge className={`text-xs ${getTypeColor(account.type)}`}>
            {t(`accounts.types.${account.type}`)}
          </Badge>
        </div>

        {/* Postable indicator - fixed width for alignment */}
        <div className="w-[90px] mr-2">
          {account.postable && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              <span>{t('accounts.postable')}</span>
            </div>
          )}
        </div>

        {/* Level indicator - fixed width for alignment */}
        <span className="text-xs text-gray-500 w-[60px] mr-3">
          {t('accounts.level')} {account.level}
        </span>

        {/* Actions dropdown */}
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
              onClick={() => onAddChild(account)}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>{t('accounts.actions.addChild')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onEdit(account)}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              <span>{t('common.edit')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={() => onDelete(account)}
              disabled={hasChildren}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>{t('common.delete')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {account.subaccounts!.map((child) => (
            <TreeNode
              key={child.id}
              account={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AccountsTree({ accounts, onEdit, onDelete, onAddChild }: AccountsTreeProps) {
  const { t } = useTranslation();

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
      <div className="p-4">
        {accounts.map((account) => (
          <TreeNode
            key={account.id}
            account={account}
            level={0}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
          />
        ))}
      </div>
    </div>
  );
}
