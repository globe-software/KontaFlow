/**
 * Charts of Accounts API Service
 * Handles all API calls related to charts of accounts
 */

import { apiClient } from '@/lib/api-client';
import type {
  ChartOfAccounts,
  CreateChartOfAccountsDto,
  UpdateChartOfAccountsDto,
  ListChartsOfAccountsFilters,
  ApiResponse,
  ApiListResponse,
} from '@/types/chart-of-accounts';

export class ChartsOfAccountsService {
  private readonly baseUrl = '/api/charts-of-accounts';

  /**
   * List all charts of accounts with optional filters
   */
  async list(filters?: ListChartsOfAccountsFilters): Promise<ApiListResponse<ChartOfAccounts>> {
    return apiClient.get<ApiListResponse<ChartOfAccounts>>(this.baseUrl, filters);
  }

  /**
   * Get a chart of accounts by ID
   */
  async getById(id: number): Promise<ApiResponse<ChartOfAccounts>> {
    return apiClient.get<ApiResponse<ChartOfAccounts>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new chart of accounts
   */
  async create(data: CreateChartOfAccountsDto): Promise<ApiResponse<ChartOfAccounts>> {
    return apiClient.post<ApiResponse<ChartOfAccounts>>(this.baseUrl, data);
  }

  /**
   * Update a chart of accounts
   */
  async update(
    id: number,
    data: UpdateChartOfAccountsDto
  ): Promise<ApiResponse<ChartOfAccounts>> {
    return apiClient.put<ApiResponse<ChartOfAccounts>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete a chart of accounts
   */
  async delete(id: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.delete<ApiResponse<{ success: boolean; message: string }>>(
      `${this.baseUrl}/${id}`
    );
  }
}

// Export singleton instance
export const chartsOfAccountsService = new ChartsOfAccountsService();
