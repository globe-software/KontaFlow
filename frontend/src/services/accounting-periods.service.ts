/**
 * Accounting Periods API Service
 * Handles all API calls related to accounting periods
 */

import { apiClient } from '@/lib/api-client';
import type {
  AccountingPeriod,
  CreateAccountingPeriodDto,
  UpdateAccountingPeriodDto,
  ListAccountingPeriodsFilters,
  ApiResponse,
  ApiListResponse,
} from '@/types/accounting-period';

export class AccountingPeriodsService {
  private readonly baseUrl = '/api/accounting-periods';

  /**
   * List all accounting periods with optional filters
   */
  async list(filters?: ListAccountingPeriodsFilters): Promise<ApiListResponse<AccountingPeriod>> {
    return apiClient.get<ApiListResponse<AccountingPeriod>>(this.baseUrl, filters);
  }

  /**
   * Get periods by economic group
   */
  async getByGroup(economicGroupId: number): Promise<ApiResponse<AccountingPeriod[]>> {
    return apiClient.get<ApiResponse<AccountingPeriod[]>>(`${this.baseUrl}/by-group/${economicGroupId}`);
  }

  /**
   * Get an accounting period by ID
   */
  async getById(id: number): Promise<ApiResponse<AccountingPeriod>> {
    return apiClient.get<ApiResponse<AccountingPeriod>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new accounting period
   */
  async create(data: CreateAccountingPeriodDto): Promise<ApiResponse<AccountingPeriod>> {
    return apiClient.post<ApiResponse<AccountingPeriod>>(this.baseUrl, data);
  }

  /**
   * Update an accounting period
   */
  async update(
    id: number,
    data: UpdateAccountingPeriodDto
  ): Promise<ApiResponse<AccountingPeriod>> {
    return apiClient.put<ApiResponse<AccountingPeriod>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Close an accounting period
   */
  async closePeriod(id: number): Promise<ApiResponse<AccountingPeriod>> {
    return apiClient.post<ApiResponse<AccountingPeriod>>(`${this.baseUrl}/${id}/close`, {});
  }

  /**
   * Reopen an accounting period
   */
  async reopenPeriod(id: number): Promise<ApiResponse<AccountingPeriod>> {
    return apiClient.post<ApiResponse<AccountingPeriod>>(`${this.baseUrl}/${id}/reopen`, {});
  }

  /**
   * Delete an accounting period (soft delete)
   */
  async delete(id: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.delete<ApiResponse<{ success: boolean; message: string }>>(
      `${this.baseUrl}/${id}`
    );
  }
}

// Export singleton instance
export const accountingPeriodsService = new AccountingPeriodsService();
