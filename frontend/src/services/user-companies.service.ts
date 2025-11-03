/**
 * User-Company Permissions API Service
 * Handles all API calls related to user-company relationships
 */

import { apiClient } from '@/lib/api-client';
import type {
  UserCompany,
  CreateUserCompanyDto,
  UpdateUserCompanyDto,
  ListUserCompaniesFilters,
  ApiResponse,
  ApiListResponse,
} from '@/types/user-company';

export class UserCompaniesService {
  private readonly baseUrl = '/api/user-companies';

  /**
   * List all user-company permissions with optional filters
   */
  async list(filters?: ListUserCompaniesFilters): Promise<ApiListResponse<UserCompany>> {
    return apiClient.get<ApiListResponse<UserCompany>>(this.baseUrl, filters);
  }

  /**
   * Get a specific user-company permission
   */
  async getById(userId: number, companyId: number): Promise<ApiResponse<UserCompany>> {
    return apiClient.get<ApiResponse<UserCompany>>(`${this.baseUrl}/${userId}/${companyId}`);
  }

  /**
   * Create a new user-company permission
   */
  async create(data: CreateUserCompanyDto): Promise<ApiResponse<UserCompany>> {
    return apiClient.post<ApiResponse<UserCompany>>(this.baseUrl, data);
  }

  /**
   * Update a user-company permission
   */
  async update(
    userId: number,
    companyId: number,
    data: UpdateUserCompanyDto
  ): Promise<ApiResponse<UserCompany>> {
    return apiClient.put<ApiResponse<UserCompany>>(
      `${this.baseUrl}/${userId}/${companyId}`,
      data
    );
  }

  /**
   * Delete a user-company permission
   */
  async delete(
    userId: number,
    companyId: number
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.delete<ApiResponse<{ success: boolean; message: string }>>(
      `${this.baseUrl}/${userId}/${companyId}`
    );
  }
}

// Export singleton instance
export const userCompaniesService = new UserCompaniesService();
