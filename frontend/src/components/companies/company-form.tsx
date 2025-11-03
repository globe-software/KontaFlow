'use client';

import { useState, useEffect } from 'react';
import type { Company, CreateCompanyDto } from '@/types/company';
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
import { economicGroupsService } from '@/services/economic-groups.service';
import type { EconomicGroup } from '@/types/economic-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface CompanyFormProps {
  company?: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCompanyDto) => Promise<void>;
}

export function CompanyForm({ company, open, onOpenChange, onSubmit }: CompanyFormProps) {
  const { t } = useTranslation();
  const [economicGroups, setEconomicGroups] = useState<EconomicGroup[]>([]);
  const [formData, setFormData] = useState<CreateCompanyDto>({
    economicGroupId: 0,
    name: '',
    tradeName: null,
    rut: '',
    country: 'UY',
    functionalCurrency: 'UYU',
    startDate: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [startDate, setStartDate] = useState<Date | undefined>();

  // Load economic groups
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const response = await economicGroupsService.list({ limit: 100 });
        setEconomicGroups(response.data);
      } catch (err) {
        console.error('Error loading economic groups:', err);
      }
    };
    if (open) {
      loadGroups();
    }
  }, [open]);

  // Load company data when editing
  useEffect(() => {
    if (company) {
      setFormData({
        economicGroupId: company.economicGroupId,
        name: company.name,
        tradeName: company.tradeName,
        rut: company.rut,
        country: company.country,
        functionalCurrency: company.functionalCurrency,
        startDate: company.startDate,
      });
      if (company.startDate) {
        setStartDate(new Date(company.startDate));
      }
    } else {
      setFormData({
        economicGroupId: 0,
        name: '',
        tradeName: null,
        rut: '',
        country: 'UY',
        functionalCurrency: 'UYU',
        startDate: null,
      });
      setStartDate(undefined);
    }
    setErrors({});
  }, [company, open]);

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

  const handleDateChange = (date: Date | undefined) => {
    setStartDate(date);
    setFormData({
      ...formData,
      startDate: date ? date.toISOString().split('T')[0] : null,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {company ? t('companies.editButton') : t('companies.createButton')}
          </SheetTitle>
          <SheetDescription>
            {company
              ? t('companies.form.editDescription')
              : t('companies.form.createDescription')}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid gap-4 py-4">
            {/* Economic Group */}
            <div className="grid gap-2">
              <Label htmlFor="economicGroupId">
                {t('companies.form.economicGroupLabel')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.economicGroupId.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, economicGroupId: parseInt(value) })
                }
              >
                <SelectTrigger className={errors.economicGroupId ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t('companies.form.economicGroupPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {economicGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.economicGroupId && (
                <p className="text-sm text-red-500">{errors.economicGroupId}</p>
              )}
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                {t('companies.form.nameLabel')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t('companies.form.namePlaceholder')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Trade Name */}
            <div className="grid gap-2">
              <Label htmlFor="tradeName">
                {t('companies.form.tradeNameLabel')}
              </Label>
              <Input
                id="tradeName"
                value={formData.tradeName || ''}
                onChange={(e) =>
                  setFormData({ ...formData, tradeName: e.target.value || null })
                }
                placeholder={t('companies.form.tradeNamePlaceholder')}
                className={errors.tradeName ? 'border-red-500' : ''}
              />
              {errors.tradeName && (
                <p className="text-sm text-red-500">{errors.tradeName}</p>
              )}
            </div>

            {/* RUT */}
            <div className="grid gap-2">
              <Label htmlFor="rut">
                {t('companies.form.rutLabel')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="rut"
                value={formData.rut}
                onChange={(e) =>
                  setFormData({ ...formData, rut: e.target.value })
                }
                placeholder={t('companies.form.rutPlaceholder')}
                className={errors.rut ? 'border-red-500' : ''}
              />
              {errors.rut && (
                <p className="text-sm text-red-500">{errors.rut}</p>
              )}
            </div>

            {/* Country */}
            <div className="grid gap-2">
              <Label htmlFor="country">
                {t('companies.form.countryLabel')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.country}
                onValueChange={(value) =>
                  setFormData({ ...formData, country: value })
                }
              >
                <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
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
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country}</p>
              )}
            </div>

            {/* Functional Currency */}
            <div className="grid gap-2">
              <Label htmlFor="functionalCurrency">
                {t('companies.form.functionalCurrencyLabel')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.functionalCurrency}
                onValueChange={(value) =>
                  setFormData({ ...formData, functionalCurrency: value })
                }
              >
                <SelectTrigger className={errors.functionalCurrency ? 'border-red-500' : ''}>
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
              {errors.functionalCurrency && (
                <p className="text-sm text-red-500">{errors.functionalCurrency}</p>
              )}
            </div>

            {/* Start Date */}
            <div className="grid gap-2">
              <Label htmlFor="startDate">
                {t('companies.form.startDateLabel')}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      errors.startDate ? 'border-red-500' : ''
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : t('companies.form.startDatePlaceholder')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate}</p>
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
              {isLoading ? t('common.saving') : company ? t('common.save') : t('common.create')}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
