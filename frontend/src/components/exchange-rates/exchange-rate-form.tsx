'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('exchangeRates.form');
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
      rate: 0,
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
        rate: exchangeRate.rate,
        source: exchangeRate.source || '',
      });
    } else {
      reset({
        economicGroupId: 1,
        date: new Date().toISOString().split('T')[0],
        sourceCurrency: 'USD',
        targetCurrency: 'UYU',
        rate: 0,
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
            {exchangeRate ? t('editButton') : t('createDescription')}
          </SheetTitle>
          <SheetDescription>
            {exchangeRate ? t('editDescription') : t('createDescription')}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 py-6">
          <input type="hidden" {...register('economicGroupId')} value={1} />

          <div className="space-y-2">
            <Label htmlFor="date">{t('dateLabel')}</Label>
            <Input
              id="date"
              type="date"
              {...register('date', {
                required: t('errors.dateRequired'),
              })}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourceCurrency">{t('sourceCurrencyLabel')}</Label>
              <Select
                value={sourceCurrency}
                onValueChange={(value) => setValue('sourceCurrency', value as Currency)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('sourceCurrencyPlaceholder')} />
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
              <Label htmlFor="targetCurrency">{t('targetCurrencyLabel')}</Label>
              <Select
                value={targetCurrency}
                onValueChange={(value) => setValue('targetCurrency', value as Currency)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('targetCurrencyPlaceholder')} />
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

          <div className="space-y-2">
            <Label htmlFor="rate">{t('rateLabel')}</Label>
            <Input
              id="rate"
              type="number"
              step="0.0001"
              placeholder={t('ratePlaceholder')}
              {...register('rate', {
                required: t('errors.rateRequired'),
                valueAsNumber: true,
                min: {
                  value: 0.0001,
                  message: t('errors.ratePositive'),
                },
              })}
            />
            {errors.rate && (
              <p className="text-sm text-destructive">{errors.rate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">{t('sourceLabel')}</Label>
            <Input
              id="source"
              type="text"
              placeholder={t('sourcePlaceholder')}
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
