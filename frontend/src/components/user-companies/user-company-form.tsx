'use client';

import { useState, useEffect } from 'react';
import type { UserCompany, CreateUserCompanyDto } from '@/types/user-company';
import { useTranslation } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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

interface UserCompanyFormProps {
  permission?: UserCompany;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateUserCompanyDto) => Promise<void>;
  users: Array<{ id: number; name: string; email: string }>;
  companies: Array<{ id: number; name: string }>;
}

export function UserCompanyForm({
  permission,
  open,
  onOpenChange,
  onSubmit,
  users,
  companies,
}: UserCompanyFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateUserCompanyDto>({
    userId: 0,
    companyId: 0,
    canWrite: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (permission) {
      setFormData({
        userId: permission.userId,
        companyId: permission.companyId,
        canWrite: permission.canWrite,
      });
    } else {
      setFormData({
        userId: 0,
        companyId: 0,
        canWrite: false,
      });
    }
    setErrors({});
  }, [permission, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.userId || formData.userId === 0) {
      newErrors.userId = t('userCompanies.form.errors.userRequired');
    }
    if (!formData.companyId || formData.companyId === 0) {
      newErrors.companyId = t('userCompanies.form.errors.companyRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
            {permission ? t('userCompanies.editButton') : t('userCompanies.createButton')}
          </SheetTitle>
          <SheetDescription>
            {permission
              ? t('userCompanies.form.editDescription')
              : t('userCompanies.form.createDescription')}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid gap-4 py-4">
            {/* User Selection */}
            <div className="grid gap-2">
              <Label htmlFor="userId">
                {t('userCompanies.form.userLabel')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.userId.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, userId: Number(value) })
                }
                disabled={!!permission}
              >
                <SelectTrigger className={errors.userId ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t('userCompanies.form.userPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.userId && (
                <p className="text-sm text-red-500">{errors.userId}</p>
              )}
            </div>

            {/* Company Selection */}
            <div className="grid gap-2">
              <Label htmlFor="companyId">
                {t('userCompanies.form.companyLabel')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.companyId.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, companyId: Number(value) })
                }
                disabled={!!permission}
              >
                <SelectTrigger className={errors.companyId ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t('userCompanies.form.companyPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.companyId && (
                <p className="text-sm text-red-500">{errors.companyId}</p>
              )}
            </div>

            {/* Can Write Permission */}
            <div className="grid gap-2">
              <Label htmlFor="canWrite">{t('userCompanies.form.permissionLabel')}</Label>
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <Switch
                  id="canWrite"
                  checked={formData.canWrite}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, canWrite: checked })
                  }
                  className="data-[state=checked]:bg-green-600"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {formData.canWrite ? t('userCompanies.permissions.write') : t('userCompanies.permissions.read')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formData.canWrite
                      ? t('userCompanies.permissions.writeDescription')
                      : t('userCompanies.permissions.readDescription')}
                  </span>
                </div>
              </div>
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
              {isLoading
                ? t('common.saving')
                : permission
                ? t('common.save')
                : t('common.create')}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
