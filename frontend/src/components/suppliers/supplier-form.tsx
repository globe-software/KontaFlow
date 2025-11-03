'use client';

import { useState, useEffect } from 'react';
import type { Supplier, CreateSupplierDto } from '@/types/supplier';
import { useTranslation } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface SupplierFormProps {
  supplier?: Supplier;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSupplierDto) => Promise<void>;
}

export function SupplierForm({ supplier, open, onOpenChange, onSubmit }: SupplierFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateSupplierDto>({
    economicGroupId: 1, // Temporary fixed value
    name: '',
    rut: '',
    email: '',
    phone: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load supplier data when editing
  useEffect(() => {
    if (supplier) {
      setFormData({
        economicGroupId: supplier.economicGroupId,
        name: supplier.name,
        rut: supplier.rut || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
      });
    } else {
      setFormData({
        economicGroupId: 1, // Temporary fixed value
        name: '',
        rut: '',
        email: '',
        phone: '',
        address: '',
      });
    }
    setErrors({});
  }, [supplier, open]);

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
            {supplier ? t('suppliers.editButton') : t('suppliers.createButton')}
          </SheetTitle>
          <SheetDescription>
            {supplier
              ? t('suppliers.form.editDescription')
              : t('suppliers.form.createDescription')}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid gap-4 py-4">
            {/* Economic Group ID (hidden for now, using fixed value) */}
            <input type="hidden" value={formData.economicGroupId} />

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                {t('suppliers.form.nameLabel')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t('suppliers.form.namePlaceholder')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* RUT */}
            <div className="grid gap-2">
              <Label htmlFor="rut">{t('suppliers.form.rutLabel')}</Label>
              <Input
                id="rut"
                value={formData.rut}
                onChange={(e) =>
                  setFormData({ ...formData, rut: e.target.value })
                }
                placeholder={t('suppliers.form.rutPlaceholder')}
                className={errors.rut ? 'border-red-500' : ''}
              />
              {errors.rut && (
                <p className="text-sm text-red-500">{errors.rut}</p>
              )}
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">{t('suppliers.form.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder={t('suppliers.form.emailPlaceholder')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="phone">{t('suppliers.form.phoneLabel')}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder={t('suppliers.form.phonePlaceholder')}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="address">{t('suppliers.form.addressLabel')}</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder={t('suppliers.form.addressPlaceholder')}
                className={errors.address ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address}</p>
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
              {isLoading ? t('common.saving') : supplier ? t('common.save') : t('common.create')}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
