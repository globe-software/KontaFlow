'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { EconomicGroup } from '@/types/economic-group';
import { economicGroupsService } from '@/services/economic-groups.service';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { getErrorMessage, formatDate } from '@/lib/utils';
import { PAISES, MONEDAS } from '@/lib/config';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Edit2,
  Loader2,
  Settings,
  Trash2,
  Users,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export default function EconomicGroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = Number(params.id);

  const [group, setGroup] = useState<EconomicGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await economicGroupsService.getById(groupId);
      console.log('Group response:', response);
      console.log('Group data:', JSON.stringify(response, null, 2));
      setGroup(response.data);
    } catch (err) {
      console.error('Error loading group:', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    // Navigate to list with query param to open edit modal
    router.push(`/economic-groups?edit=${groupId}`);
  };

  const handleDelete = async () => {
    if (!group) return;
    if (!confirm(`¿Estás seguro de eliminar el grupo "${group.name}"?`)) {
      return;
    }

    try {
      await economicGroupsService.delete(group.id);
      router.push('/economic-groups');
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 px-6">
          <div className="flex min-h-[400px] flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium text-gray-600">Loading group...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !group) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 px-6">
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Error loading group</h3>
                <p className="text-sm text-red-700 mt-0.5">
                  {error || 'Group not found'}
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => router.push('/economic-groups')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Groups
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-6">
        {/* Breadcrumb y acciones */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push('/economic-groups')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <span className="text-gray-400">/</span>
            <span className="text-sm text-gray-600">Economic Groups</span>
            <span className="text-gray-400">/</span>
            <span className="text-sm font-medium text-gray-900">{group.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleEdit} variant="outline" size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              size="sm"
              disabled={!group.active}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Header Card */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {group.name}
                </h1>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>{PAISES[group.mainCountry]}</span>
                  <span>•</span>
                  <span>
                    {group.baseCurrency} ({MONEDAS[group.baseCurrency]})
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Created on {formatDate(group.createdAt)}
                </p>
              </div>
            </div>

            <div>
              {group.active ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </Badge>
              ) : (
                <Badge className="flex items-center gap-1 bg-gray-100 text-gray-700">
                  <XCircle className="h-3 w-3" />
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="info">
              <Building2 className="h-4 w-4 mr-2" />
              Information
            </TabsTrigger>
            <TabsTrigger value="empresas">
              <Users className="h-4 w-4 mr-2" />
              Companies ({group.companies?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                General Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-gray-900">{group.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Main Country</label>
                  <p className="mt-1 text-gray-900">{PAISES[group.mainCountry]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Base Currency</label>
                  <p className="mt-1 text-gray-900">
                    {group.baseCurrency} - {MONEDAS[group.baseCurrency]}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1">
                    {group.active ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : (
                      <span className="text-gray-600 font-medium">Inactive</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Created Date</label>
                  <p className="mt-1 text-gray-900">{formatDate(group.createdAt)}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="empresas">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Associated Companies
                </h3>
                <Button size="sm" onClick={() => router.push('/companies?create=true')}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Add Company
                </Button>
              </div>

              {group.companies && group.companies.length > 0 ? (
                <div className="space-y-3">
                  {group.companies.map((company) => (
                    <div
                      key={company.id}
                      onClick={() => router.push(`/companies/${company.id}`)}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{company.name}</p>
                          <p className="text-sm text-gray-600">
                            RUT: {company.rut} • {company.functionalCurrency}
                          </p>
                        </div>
                      </div>
                      <div>
                        {company.active ? (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge className="flex items-center gap-1 bg-gray-100 text-gray-700">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No companies associated with this group</p>
                  <p className="text-sm mt-1">
                    Companies you add will appear here
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="config">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Accounting Configuration
              </h3>
              <div className="text-center py-12 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Accounting configuration will be available soon</p>
                <p className="text-sm mt-1">
                  Chart of accounts, fiscal years, etc.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
