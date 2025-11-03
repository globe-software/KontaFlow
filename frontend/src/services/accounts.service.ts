/**
 * Accounts API Service
 * Handles all API calls related to accounts
 */

import { apiClient } from '@/lib/api-client';
import type {
  Account,
  CreateAccountDto,
  UpdateAccountDto,
  ListAccountsFilters,
  ApiResponse,
  ApiListResponse,
} from '@/types/account';

export class AccountsService {
  private readonly baseUrl = '/api/accounts';

  /**
   * List all accounts with optional filters
   */
  async list(filters?: ListAccountsFilters): Promise<ApiListResponse<Account>> {
    return apiClient.get<ApiListResponse<Account>>(this.baseUrl, filters);
  }

  /**
   * Get accounts in tree structure
   */
  async getTree(chartOfAccountsId: number): Promise<ApiResponse<Account[]>> {
    return apiClient.get<ApiResponse<Account[]>>(`${this.baseUrl}/tree/${chartOfAccountsId}`);
  }

  /**
   * Get accounts by chart of accounts
   */
  async getByChart(chartOfAccountsId: number): Promise<ApiResponse<Account[]>> {
    return apiClient.get<ApiResponse<Account[]>>(`${this.baseUrl}/by-chart/${chartOfAccountsId}`);
  }

  /**
   * Get an account by ID
   */
  async getById(id: number): Promise<ApiResponse<Account>> {
    return apiClient.get<ApiResponse<Account>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new account
   */
  async create(data: CreateAccountDto): Promise<ApiResponse<Account>> {
    return apiClient.post<ApiResponse<Account>>(this.baseUrl, data);
  }

  /**
   * Update an account
   */
  async update(
    id: number,
    data: UpdateAccountDto
  ): Promise<ApiResponse<Account>> {
    return apiClient.put<ApiResponse<Account>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete an account (soft delete)
   */
  async delete(id: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.delete<ApiResponse<{ success: boolean; message: string }>>(
      `${this.baseUrl}/${id}`
    );
  }
}

// Export singleton instance
export const accountsService = new AccountsService();
