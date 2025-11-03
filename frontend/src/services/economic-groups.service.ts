/**
 * Economic Groups API Service
 * Handles all API calls related to economic groups
 */

import { apiClient } from '@/lib/api-client';
import type {
  EconomicGroup,
  CreateEconomicGroupDto,
  UpdateEconomicGroupDto,
  ListEconomicGroupsFilters,
  ApiResponse,
  ApiListResponse,
} from '@/types/economic-group';

export class EconomicGroupsService {
  private readonly baseUrl = '/api/economic-groups';

  /**
   * List all economic groups with optional filters
   */
  async list(filters?: ListEconomicGroupsFilters): Promise<ApiListResponse<EconomicGroup>> {
    return apiClient.get<ApiListResponse<EconomicGroup>>(this.baseUrl, filters);
  }

  /**
   * Get user's economic groups
   */
  async getMyGroups(): Promise<ApiResponse<EconomicGroup[]>> {
    return apiClient.get<ApiResponse<EconomicGroup[]>>(`${this.baseUrl}/my-groups`);
  }

  /**
   * Get an economic group by ID
   */
  async getById(id: number): Promise<ApiResponse<EconomicGroup>> {
    return apiClient.get<ApiResponse<EconomicGroup>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new economic group
   */
  async create(data: CreateEconomicGroupDto): Promise<ApiResponse<EconomicGroup>> {
    return apiClient.post<ApiResponse<EconomicGroup>>(this.baseUrl, data);
  }

  /**
   * Update an economic group
   */
  async update(
    id: number,
    data: UpdateEconomicGroupDto
  ): Promise<ApiResponse<EconomicGroup>> {
    return apiClient.put<ApiResponse<EconomicGroup>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete an economic group (soft delete)
   */
  async delete(id: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.delete<ApiResponse<{ success: boolean; message: string }>>(
      `${this.baseUrl}/${id}`
    );
  }
}

// Export singleton instance
export const economicGroupsService = new EconomicGroupsService();
