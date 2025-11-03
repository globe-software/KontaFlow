'use client';

import { useState, useEffect } from 'react';
import type { AccountingPeriod, CreateAccountingPeriodDto, PeriodType } from '@/types/accounting-period';
import type { EconomicGroup } from '@/types/economic-group';
import { useTranslation } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { economicGroupsService } from '@/services/economic-groups.service';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface PeriodFormProps {
  period?: AccountingPeriod;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAccountingPeriodDto) => Promise<void>;
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export function PeriodForm({ period, open, onOpenChange, onSubmit }: PeriodFormProps) {
  const { t } = useTranslation();
  const [economicGroups, setEconomicGroups] = useState<EconomicGroup[]>([]);
  const [formData, setFormData] = useState<CreateAccountingPeriodDto>({
    economicGroupId: 0,
    type: 'FISCAL_YEAR',
    fiscalYear: new Date().getFullYear(),
    month: null,
    startDate: '',
    endDate: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Load economic groups
  useEffect(() => {
    const loadGroups = async () => {
      if (!open) return;
      try {
        const response = await economicGroupsService.list({ limit: 100 });
        setEconomicGroups(response.data);
      } catch (err) {
        console.error('Error loading economic groups:', err);
      }
    };
    loadGroups();
  }, [open]);

  // Load period data when editing
  useEffect(() => {
    if (period) {
      setFormData({
        economicGroupId: period.economicGroupId,
        type: period.type,
        fiscalYear: period.fiscalYear,
        month: period.month,
        startDate: period.startDate,
        endDate: period.endDate,
      });
      setStartDate(new Date(period.startDate));
      setEndDate(new Date(period.endDate));
    } else {
      const currentYear = new Date().getFullYear();
      setFormData({
        economicGroupId: 0,
        type: 'FISCAL_YEAR',
        fiscalYear: currentYear,
        month: null,
        startDate: `${currentYear}-01-01`,
        endDate: `${currentYear}-12-31`,
      });
      setStartDate(new Date(`${currentYear}-01-01`));
      setEndDate(new Date(`${currentYear}-12-31`));
    }
    setErrors({});
  }, [period, open]);

  // Auto-populate dates based on type, year, and month
  useEffect(() => {
    if (formData.type === 'FISCAL_YEAR') {
      const start = `${formData.fiscalYear}-01-01`;
      const end = `${formData.fiscalYear}-12-31`;
      setFormData(prev => ({ ...prev, startDate: start, endDate: end, month: null }));
      setStartDate(new Date(start));
      setEndDate(new Date(end));
    } else if (formData.type === 'MONTH' && formData.month) {
      const month = formData.month;
      const year = formData.fiscalYear;
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0); // Last day of month

      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];

      setFormData(prev => ({ ...prev, startDate: startStr, endDate: endStr }));
      setStartDate(start);
      setEndDate(end);
    }
  }, [formData.type, formData.fiscalYear, formData.month]);

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

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
      setFormData({
        ...formData,
        startDate: date.toISOString().split('T')[0],
      });
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      setEndDate(date);
      setFormData({
        ...formData,
        endDate: date.toISOString().split('T')[0],
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {period ? t('periods.editButton') : t('periods.createButton')}
          </SheetTitle>
          <SheetDescription>
            {period
              ? t('periods.form.editDescription')
              : t('periods.form.createDescription')}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid gap-4 py-4">
            {/* Economic Group */}
            <div className="grid gap-2">
              <Label htmlFor="economicGroupId">
                {t('periods.form.economicGroupLabel')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.economicGroupId.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, economicGroupId: parseInt(value) })
                }
              >
                <SelectTrigger className={errors.economicGroupId ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t('periods.form.economicGroupPlaceholder')} />
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

            {/* Period Type (Radio) */}
            <div className="grid gap-2">
              <Label>
                {t('periods.form.typeLabel')} <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value: PeriodType) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FISCAL_YEAR" id="fiscal-year" />
                  <Label htmlFor="fiscal-year" className="font-normal cursor-pointer">
                    {t('periods.types.FISCAL_YEAR')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MONTH" id="month" />
                  <Label htmlFor="month" className="font-normal cursor-pointer">
                    {t('periods.types.MONTH')}
                  </Label>
                </div>
              </RadioGroup>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}
            </div>

            {/* Fiscal Year */}
            <div className="grid gap-2">
              <Label htmlFor="fiscalYear">
                {t('periods.form.fiscalYearLabel')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fiscalYear"
                type="number"
                value={formData.fiscalYear}
                onChange={(e) =>
                  setFormData({ ...formData, fiscalYear: parseInt(e.target.value) })
                }
                placeholder="2024"
                className={errors.fiscalYear ? 'border-red-500' : ''}
              />
              {errors.fiscalYear && (
                <p className="text-sm text-red-500">{errors.fiscalYear}</p>
              )}
            </div>

            {/* Month (only if type is MONTH) */}
            {formData.type === 'MONTH' && (
              <div className="grid gap-2">
                <Label htmlFor="month">
                  {t('periods.form.monthLabel')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.month?.toString() || ''}
                  onValueChange={(value) =>
                    setFormData({ ...formData, month: parseInt(value) })
                  }
                >
                  <SelectTrigger className={errors.month ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('periods.form.monthPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {t(`periods.months.${month.label}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.month && (
                  <p className="text-sm text-red-500">{errors.month}</p>
                )}
              </div>
            )}

            {/* Start Date */}
            <div className="grid gap-2">
              <Label htmlFor="startDate">
                {t('periods.form.startDateLabel')} <span className="text-red-500">*</span>
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
                    {startDate ? format(startDate, 'PPP') : t('periods.form.selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div className="grid gap-2">
              <Label htmlFor="endDate">
                {t('periods.form.endDateLabel')} <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      errors.endDate ? 'border-red-500' : ''
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : t('periods.form.selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate}</p>
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
              {isLoading ? t('common.saving') : period ? t('common.save') : t('common.create')}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
