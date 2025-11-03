'use client';

import { useState, useEffect } from 'react';
import type { EconomicGroup, CreateEconomicGroupDto, Country, Currency } from '@/types/economic-group';
import { useTranslation } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { PAISES, MONEDAS } from '@/lib/config';

interface EconomicGroupFormProps {
  group?: EconomicGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEconomicGroupDto) => Promise<void>;
}

export function EconomicGroupForm({ group, open, onOpenChange, onSubmit }: EconomicGroupFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateEconomicGroupDto>({
    name: '',
    mainCountry: 'UY',
    baseCurrency: 'UYU',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load group data when editing
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        mainCountry: group.mainCountry,
        baseCurrency: group.baseCurrency,
      });
    } else {
      setFormData({
        name: '',
        mainCountry: 'UY',
        baseCurrency: 'UYU',
      });
    }
    setErrors({});
  }, [group, open]);

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {group ? t('grupos.editButton') : t('grupos.createButton')}
          </SheetTitle>
          <SheetDescription>
            {group
              ? t('grupos.form.editDescription')
              : t('grupos.form.createDescription')}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                {t('grupos.form.nameLabel')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t('grupos.form.namePlaceholder')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Main Country */}
            <div className="grid gap-2">
              <Label htmlFor="mainCountry">
                {t('grupos.form.countryLabel')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.mainCountry}
                onValueChange={(value: Country) =>
                  setFormData({ ...formData, mainCountry: value })
                }
              >
                <SelectTrigger className={errors.mainCountry ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAISES).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mainCountry && (
                <p className="text-sm text-red-500">{errors.mainCountry}</p>
              )}
            </div>

            {/* Base Currency */}
            <div className="grid gap-2">
              <Label htmlFor="baseCurrency">
                {t('grupos.form.currencyLabel')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.baseCurrency}
                onValueChange={(value: Currency) =>
                  setFormData({ ...formData, baseCurrency: value })
                }
              >
                <SelectTrigger className={errors.baseCurrency ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MONEDAS).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name} ({code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.baseCurrency && (
                <p className="text-sm text-red-500">{errors.baseCurrency}</p>
              )}
            </div>
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
              {isLoading ? t('common.saving') : group ? t('common.save') : t('common.create')}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
