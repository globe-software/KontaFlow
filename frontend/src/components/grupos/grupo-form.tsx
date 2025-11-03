'use client';

import { useState, useEffect } from 'react';
import type { GrupoEconomico, CreateGrupoDto, Pais, Moneda } from '@/types/grupo';
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

interface GrupoFormProps {
  grupo?: GrupoEconomico;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateGrupoDto) => Promise<void>;
}

export function GrupoForm({ grupo, open, onOpenChange, onSubmit }: GrupoFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateGrupoDto>({
    nombre: '',
    paisPrincipal: 'UY',
    monedaBase: 'UYU',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos del grupo al editar
  useEffect(() => {
    if (grupo) {
      setFormData({
        nombre: grupo.nombre,
        paisPrincipal: grupo.paisPrincipal,
        monedaBase: grupo.monedaBase,
      });
    } else {
      setFormData({
        nombre: '',
        paisPrincipal: 'UY',
        monedaBase: 'UYU',
      });
    }
    setErrors({});
  }, [grupo, open]);

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
            {grupo ? t('grupos.editButton') : t('grupos.createButton')}
          </SheetTitle>
          <SheetDescription>
            {grupo
              ? t('grupos.form.editDescription')
              : t('grupos.form.createDescription')}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid gap-4 py-4">
            {/* Nombre */}
            <div className="grid gap-2">
              <Label htmlFor="nombre">
                {t('grupos.form.nameLabel')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder={t('grupos.form.namePlaceholder')}
                className={errors.nombre ? 'border-red-500' : ''}
              />
              {errors.nombre && (
                <p className="text-sm text-red-500">{errors.nombre}</p>
              )}
            </div>

            {/* País Principal */}
            <div className="grid gap-2">
              <Label htmlFor="paisPrincipal">
                {t('grupos.form.countryLabel')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.paisPrincipal}
                onValueChange={(value: Pais) =>
                  setFormData({ ...formData, paisPrincipal: value })
                }
              >
                <SelectTrigger className={errors.paisPrincipal ? 'border-red-500' : ''}>
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
              {errors.paisPrincipal && (
                <p className="text-sm text-red-500">{errors.paisPrincipal}</p>
              )}
            </div>

            {/* Moneda Base */}
            <div className="grid gap-2">
              <Label htmlFor="monedaBase">
                {t('grupos.form.currencyLabel')} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.monedaBase}
                onValueChange={(value: Moneda) =>
                  setFormData({ ...formData, monedaBase: value })
                }
              >
                <SelectTrigger className={errors.monedaBase ? 'border-red-500' : ''}>
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
              {errors.monedaBase && (
                <p className="text-sm text-red-500">{errors.monedaBase}</p>
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
              {isLoading ? t('common.saving') : grupo ? t('common.save') : t('common.create')}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
