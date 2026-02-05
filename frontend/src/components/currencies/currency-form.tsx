'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import type { Currency, CreateCurrencyDto } from '@/types/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CurrencyFormProps {
  currency?: Currency;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCurrencyDto) => Promise<void>;
}

export function CurrencyForm({ currency, open, onOpenChange, onSubmit }: CurrencyFormProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateCurrencyDto>({
    code: '',
    name: '',
    symbol: '',
    active: true,
    decimals: 2,
    isDefaultFunctional: false,
  });

  // Reset form when currency changes or dialog opens
  useEffect(() => {
    if (open) {
      if (currency) {
        setFormData({
          code: currency.code,
          name: currency.name,
          symbol: currency.symbol || '',
          active: currency.active,
          decimals: currency.decimals,
          isDefaultFunctional: currency.isDefaultFunctional,
        });
      } else {
        setFormData({
          code: '',
          name: '',
          symbol: '',
          active: true,
          decimals: 2,
          isDefaultFunctional: false,
        });
      }
    }
  }, [currency, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {currency ? t('currencies.editTitle') : t('currencies.createTitle')}
          </DialogTitle>
          <DialogDescription>
            {currency
              ? t('currencies.editDescription')
              : t('currencies.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Code */}
            <div className="grid gap-2">
              <Label htmlFor="code">{t('currencies.form.code')}</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                placeholder="USD"
                maxLength={3}
                required
                disabled={!!currency} // Code cannot be changed when editing
                className="uppercase"
              />
              <p className="text-xs text-muted-foreground">
                {t('currencies.form.codeHint')}
              </p>
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">{t('currencies.form.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="US Dollar"
                required
              />
            </div>

            {/* Symbol */}
            <div className="grid gap-2">
              <Label htmlFor="symbol">{t('currencies.form.symbol')}</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="$"
                maxLength={10}
              />
            </div>

            {/* Decimals */}
            <div className="grid gap-2">
              <Label htmlFor="decimals">{t('currencies.form.decimals')}</Label>
              <Select
                value={formData.decimals?.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, decimals: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 (e.g., JPY, CLP)</SelectItem>
                  <SelectItem value="2">2 (e.g., USD, EUR)</SelectItem>
                  <SelectItem value="3">3 (e.g., BHD, KWD)</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="active">{t('currencies.form.active')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('currencies.form.activeHint')}
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
            </div>

            {/* Default Functional */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="isDefaultFunctional">
                  {t('currencies.form.isDefaultFunctional')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('currencies.form.isDefaultFunctionalHint')}
                </p>
              </div>
              <Switch
                id="isDefaultFunctional"
                checked={formData.isDefaultFunctional}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isDefaultFunctional: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t('common.saving')
                : currency
                ? t('common.update')
                : t('common.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
