'use client';

import { useState, useEffect } from 'react';
import type { Account, CreateAccountDto, AccountType, CurrencyType, NatureType, AuxiliaryType } from '@/types/account';
import { useTranslation } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { accountsService } from '@/services/accounts.service';

interface AccountFormProps {
  account?: Account;
  parentAccount?: Account; // When adding a child
  chartOfAccountsId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAccountDto) => Promise<void>;
}

const ACCOUNT_TYPES: AccountType[] = ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];
const CURRENCY_TYPES: CurrencyType[] = ['MN', 'USD', 'BOTH', 'FUNCTIONAL'];
const NATURE_TYPES: NatureType[] = ['CURRENT', 'NON_CURRENT'];
const AUXILIARY_TYPES: AuxiliaryType[] = ['CUSTOMER', 'SUPPLIER', 'EMPLOYEE', 'OTHER'];

export function AccountForm({
  account,
  parentAccount,
  chartOfAccountsId,
  open,
  onOpenChange,
  onSubmit
}: AccountFormProps) {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState<CreateAccountDto>({
    chartOfAccountsId,
    code: '',
    name: '',
    parentAccountId: null,
    type: 'ASSET',
    level: 1,
    postable: true,
    requiresAuxiliary: false,
    auxiliaryType: null,
    currency: 'FUNCTIONAL',
    nature: null,
    ifrsCategory: null,
    valuationMethod: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load accounts for parent selector
  useEffect(() => {
    const loadAccounts = async () => {
      if (!open) return;
      try {
        const response = await accountsService.getByChart(chartOfAccountsId);
        setAccounts(response.data);
      } catch (err) {
        console.error('Error loading accounts:', err);
      }
    };
    loadAccounts();
  }, [open, chartOfAccountsId]);

  // Load account data when editing or adding child
  useEffect(() => {
    if (parentAccount) {
      // Adding a child to this parent
      setFormData({
        chartOfAccountsId,
        code: '',
        name: '',
        parentAccountId: parentAccount.id,
        type: parentAccount.type,
        level: parentAccount.level + 1,
        postable: true,
        requiresAuxiliary: false,
        auxiliaryType: null,
        currency: parentAccount.currency,
        nature: parentAccount.nature,
        ifrsCategory: null,
        valuationMethod: null,
      });
    } else if (account) {
      // Editing existing account
      setFormData({
        chartOfAccountsId: account.chartOfAccountsId,
        code: account.code,
        name: account.name,
        parentAccountId: account.parentAccountId,
        type: account.type,
        level: account.level,
        postable: account.postable,
        requiresAuxiliary: account.requiresAuxiliary,
        auxiliaryType: account.auxiliaryType,
        currency: account.currency,
        nature: account.nature,
        ifrsCategory: account.ifrsCategory,
        valuationMethod: account.valuationMethod,
      });
    } else {
      // Creating new root account
      setFormData({
        chartOfAccountsId,
        code: '',
        name: '',
        parentAccountId: null,
        type: 'ASSET',
        level: 1,
        postable: true,
        requiresAuxiliary: false,
        auxiliaryType: null,
        currency: 'FUNCTIONAL',
        nature: null,
        ifrsCategory: null,
        valuationMethod: null,
      });
    }
    setErrors({});
  }, [account, parentAccount, chartOfAccountsId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error: any) {
      if (error?.error?.details) {
        setErrors(error.error.details);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleParentChange = (value: string) => {
    if (value === 'none') {
      setFormData({ ...formData, parentAccountId: null, level: 1 });
    } else {
      const parentId = parseInt(value);
      const parent = accounts.find(a => a.id === parentId);
      if (parent) {
        setFormData({
          ...formData,
          parentAccountId: parentId,
          level: parent.level + 1,
          type: parent.type, // Inherit type from parent
        });
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[640px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {parentAccount
              ? t('accounts.addChildButton')
              : account
              ? t('accounts.editButton')
              : t('accounts.createButton')}
          </SheetTitle>
          <SheetDescription>
            {parentAccount
              ? `${t('accounts.form.addChildDescription')}: ${parentAccount.name}`
              : account
              ? t('accounts.form.editDescription')
              : t('accounts.form.createDescription')}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid gap-4 py-4">
            {/* Parent Account */}
            <div className="grid gap-2">
              <Label htmlFor="parentAccountId">
                {t('accounts.form.parentAccountLabel')}
              </Label>
              <Select
                value={formData.parentAccountId?.toString() || 'none'}
                onValueChange={handleParentChange}
                disabled={!!parentAccount}
              >
                <SelectTrigger className={errors.parentAccountId ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t('accounts.form.parentAccountPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('accounts.form.noParent')}</SelectItem>
                  {accounts
                    .filter(a => a.id !== account?.id) // Don't allow selecting itself
                    .map((acc) => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>
                        {acc.code} - {acc.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.parentAccountId && (
                <p className="text-sm text-red-500">{errors.parentAccountId}</p>
              )}
            </div>

            {/* Code */}
            <div className="grid gap-2">
              <Label htmlFor="code">
                {t('accounts.form.codeLabel')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder={t('accounts.form.codePlaceholder')}
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code}</p>
              )}
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                {t('accounts.form.nameLabel')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t('accounts.form.namePlaceholder')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">
                {t('accounts.form.typeLabel')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: AccountType) =>
                  setFormData({ ...formData, type: value })
                }
                disabled={!!formData.parentAccountId}
              >
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`accounts.types.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}
            </div>

            {/* Level (read-only, auto-calculated) */}
            <div className="grid gap-2">
              <Label htmlFor="level">
                {t('accounts.form.levelLabel')}
              </Label>
              <Input
                id="level"
                value={formData.level}
                readOnly
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Currency */}
            <div className="grid gap-2">
              <Label htmlFor="currency">
                {t('accounts.form.currencyLabel')}
              </Label>
              <Select
                value={formData.currency}
                onValueChange={(value: CurrencyType) =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger className={errors.currency ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_TYPES.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {t(`accounts.currencies.${curr}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currency && (
                <p className="text-sm text-red-500">{errors.currency}</p>
              )}
            </div>

            {/* Nature */}
            <div className="grid gap-2">
              <Label htmlFor="nature">
                {t('accounts.form.natureLabel')}
              </Label>
              <Select
                value={formData.nature || 'none'}
                onValueChange={(value) =>
                  setFormData({ ...formData, nature: value === 'none' ? null : value as NatureType })
                }
              >
                <SelectTrigger className={errors.nature ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('common.none')}</SelectItem>
                  {NATURE_TYPES.map((nat) => (
                    <SelectItem key={nat} value={nat as string}>
                      {t(`accounts.natures.${nat}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.nature && (
                <p className="text-sm text-red-500">{errors.nature}</p>
              )}
            </div>

            {/* Postable Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="postable"
                checked={formData.postable}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, postable: !!checked })
                }
              />
              <Label
                htmlFor="postable"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('accounts.form.postableLabel')}
              </Label>
            </div>

            {/* Requires Auxiliary Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresAuxiliary"
                checked={formData.requiresAuxiliary}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, requiresAuxiliary: !!checked })
                }
              />
              <Label
                htmlFor="requiresAuxiliary"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('accounts.form.requiresAuxiliaryLabel')}
              </Label>
            </div>

            {/* Auxiliary Type (only if requires auxiliary) */}
            {formData.requiresAuxiliary && (
              <div className="grid gap-2">
                <Label htmlFor="auxiliaryType">
                  {t('accounts.form.auxiliaryTypeLabel')}
                </Label>
                <Select
                  value={formData.auxiliaryType || 'none'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, auxiliaryType: value === 'none' ? null : value as AuxiliaryType })
                  }
                >
                  <SelectTrigger className={errors.auxiliaryType ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('common.none')}</SelectItem>
                    {AUXILIARY_TYPES.map((aux) => (
                      <SelectItem key={aux} value={aux as string}>
                        {t(`accounts.auxiliaryTypes.${aux}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.auxiliaryType && (
                  <p className="text-sm text-red-500">{errors.auxiliaryType}</p>
                )}
              </div>
            )}
          </div>

          <SheetFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common.saving') : account ? t('common.save') : t('common.create')}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
