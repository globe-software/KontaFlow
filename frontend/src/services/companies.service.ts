/**
 * Companies API Service
 * Handles all API calls related to companies
 */

import { apiClient } from '@/lib/api-client';
import type {
  Company,
  CreateCompanyDto,
  UpdateCompanyDto,
  ListCompaniesFilters,
  ApiResponse,
  ApiListResponse,
} from '@/types/company';

export class CompaniesService {
  private readonly baseUrl = '/api/companies';

  /**
   * List all companies with optional filters
   */
  async list(filters?: ListCompaniesFilters): Promise<ApiListResponse<Company>> {
    return apiClient.get<ApiListResponse<Company>>(this.baseUrl, filters);
  }

  /**
   * Get a company by ID
   */
  async getById(id: number): Promise<ApiResponse<Company>> {
    return apiClient.get<ApiResponse<Company>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new company
   */
  async create(data: CreateCompanyDto): Promise<ApiResponse<Company>> {
    return apiClient.post<ApiResponse<Company>>(this.baseUrl, data);
  }

  /**
   * Update a company
   */
  async update(
    id: number,
    data: UpdateCompanyDto
  ): Promise<ApiResponse<Company>> {
    return apiClient.put<ApiResponse<Company>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete a company (soft delete)
   */
  async delete(id: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.delete<ApiResponse<{ success: boolean; message: string }>>(
      `${this.baseUrl}/${id}`
    );
  }
}

// Export singleton instance
export const companiesService = new CompaniesService();
