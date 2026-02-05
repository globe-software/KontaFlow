'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExchangeRate, CreateExchangeRateDto, Currency } from '@/types/exchange-rate';

interface ExchangeRateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateExchangeRateDto) => Promise<void>;
  exchangeRate?: ExchangeRate;
  isLoading?: boolean;
}

const currencies: Currency[] = ['UYU', 'USD', 'ARS', 'BRL', 'CLP', 'COP', 'PEN', 'MXN', 'EUR'];

export function ExchangeRateForm({
  open,
  onOpenChange,
  onSubmit,
  exchangeRate,
  isLoading,
}: ExchangeRateFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateExchangeRateDto>({
    defaultValues: {
      economicGroupId: 1,
      date: new Date().toISOString().split('T')[0],
      sourceCurrency: 'USD',
      targetCurrency: 'UYU',
      purchaseRate: 0,
      saleRate: 0,
      averageRate: 0,
      source: '',
    },
  });

  const sourceCurrency = watch('sourceCurrency');
  const targetCurrency = watch('targetCurrency');

  useEffect(() => {
    if (exchangeRate) {
      reset({
        economicGroupId: exchangeRate.economicGroupId,
        date: exchangeRate.date,
        sourceCurrency: exchangeRate.sourceCurrency,
        targetCurrency: exchangeRate.targetCurrency,
        purchaseRate: exchangeRate.purchaseRate,
        saleRate: exchangeRate.saleRate,
        averageRate: exchangeRate.averageRate,
        source: exchangeRate.source || '',
      });
    } else {
      reset({
        economicGroupId: 1,
        date: new Date().toISOString().split('T')[0],
        sourceCurrency: 'USD',
        targetCurrency: 'UYU',
        purchaseRate: 0,
        saleRate: 0,
        averageRate: 0,
        source: '',
      });
    }
  }, [exchangeRate, reset]);

  const handleFormSubmit = async (data: CreateExchangeRateDto) => {
    await onSubmit(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {exchangeRate ? t('exchangeRates.form.editButton') : t('exchangeRates.form.createDescription')}
          </SheetTitle>
          <SheetDescription>
            {exchangeRate ? t('exchangeRates.form.editDescription') : t('exchangeRates.form.createDescription')}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 py-6">
          <input type="hidden" {...register('economicGroupId')} value={1} />

          <div className="space-y-2">
            <Label htmlFor="date">{t('exchangeRates.form.dateLabel')}</Label>
            <Input
              id="date"
              type="date"
              {...register('date', {
                required: t('exchangeRates.form.errors.dateRequired'),
              })}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourceCurrency">{t('exchangeRates.form.sourceCurrencyLabel')}</Label>
              <Select
                value={sourceCurrency}
                onValueChange={(value) => setValue('sourceCurrency', value as Currency)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('exchangeRates.form.sourceCurrencyPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sourceCurrency && (
                <p className="text-sm text-destructive">{errors.sourceCurrency.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetCurrency">{t('exchangeRates.form.targetCurrencyLabel')}</Label>
              <Select
                value={targetCurrency}
                onValueChange={(value) => setValue('targetCurrency', value as Currency)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('exchangeRates.form.targetCurrencyPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.targetCurrency && (
                <p className="text-sm text-destructive">{errors.targetCurrency.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseRate">{t('exchangeRates.form.purchaseRateLabel')}</Label>
              <Input
                id="purchaseRate"
                type="number"
                step="0.0001"
                placeholder={t('exchangeRates.form.purchaseRatePlaceholder')}
                {...register('purchaseRate', {
                  required: t('exchangeRates.form.errors.rateRequired'),
                  valueAsNumber: true,
                  min: {
                    value: 0.0001,
                    message: t('exchangeRates.form.errors.ratePositive'),
                  },
                })}
              />
              {errors.purchaseRate && (
                <p className="text-sm text-destructive">{errors.purchaseRate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="averageRate">{t('exchangeRates.form.averageRateLabel')}</Label>
              <Input
                id="averageRate"
                type="number"
                step="0.0001"
                placeholder={t('exchangeRates.form.averageRatePlaceholder')}
                {...register('averageRate', {
                  required: t('exchangeRates.form.errors.rateRequired'),
                  valueAsNumber: true,
                  min: {
                    value: 0.0001,
                    message: t('exchangeRates.form.errors.ratePositive'),
                  },
                })}
              />
              {errors.averageRate && (
                <p className="text-sm text-destructive">{errors.averageRate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="saleRate">{t('exchangeRates.form.saleRateLabel')}</Label>
              <Input
                id="saleRate"
                type="number"
                step="0.0001"
                placeholder={t('exchangeRates.form.saleRatePlaceholder')}
                {...register('saleRate', {
                  required: t('exchangeRates.form.errors.rateRequired'),
                  valueAsNumber: true,
                  min: {
                    value: 0.0001,
                    message: t('exchangeRates.form.errors.ratePositive'),
                  },
                })}
              />
              {errors.saleRate && (
                <p className="text-sm text-destructive">{errors.saleRate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">{t('exchangeRates.form.sourceLabel')}</Label>
            <Input
              id="source"
              type="text"
              placeholder={t('exchangeRates.form.sourcePlaceholder')}
              {...register('source')}
            />
          </div>

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : exchangeRate ? 'Update' : 'Create'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
