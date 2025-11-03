/**
 * API Service para Grupos Económicos
 * Mapea directamente a los endpoints del backend
 */

import { apiClient } from '../api-client';
import type {
  GrupoEconomico,
  CreateGrupoDto,
  UpdateGrupoDto,
  ListGruposFilters,
  ApiResponse,
  ApiListResponse,
} from '@/types/grupo';

export const gruposApi = {
  /**
   * Listar grupos económicos
   * GET /api/grupos
   */
  list: async (filters?: ListGruposFilters): Promise<ApiListResponse<GrupoEconomico>> => {
    return apiClient.get<ApiListResponse<GrupoEconomico>>('/api/grupos', filters);
  },

  /**
   * Obtener mis grupos (grupos del usuario autenticado)
   * GET /api/grupos/mis-grupos
   */
  myGroups: async (): Promise<ApiResponse<GrupoEconomico[]>> => {
    return apiClient.get<ApiResponse<GrupoEconomico[]>>('/api/grupos/mis-grupos');
  },

  /**
   * Obtener un grupo por ID
   * GET /api/grupos/:id
   */
  getById: async (id: number): Promise<GrupoEconomico> => {
    const response = await apiClient.get<ApiResponse<GrupoEconomico>>(`/api/grupos/${id}`);
    return response.data;
  },

  /**
   * Crear un nuevo grupo
   * POST /api/grupos
   */
  create: async (data: CreateGrupoDto): Promise<ApiResponse<GrupoEconomico>> => {
    return apiClient.post<ApiResponse<GrupoEconomico>>('/api/grupos', data);
  },

  /**
   * Actualizar un grupo
   * PUT /api/grupos/:id
   */
  update: async (
    id: number,
    data: UpdateGrupoDto
  ): Promise<ApiResponse<GrupoEconomico>> => {
    return apiClient.put<ApiResponse<GrupoEconomico>>(`/api/grupos/${id}`, data);
  },

  /**
   * Eliminar un grupo (soft delete)
   * DELETE /api/grupos/:id
   */
  delete: async (id: number): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(`/api/grupos/${id}`);
  },
};
