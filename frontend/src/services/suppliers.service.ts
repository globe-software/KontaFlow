/**
 * Suppliers API Service
 * Handles all API calls related to suppliers
 */

import { apiClient } from '@/lib/api-client';
import type {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  ListSuppliersFilters,
  ApiResponse,
  ApiListResponse,
} from '@/types/supplier';

export class SuppliersService {
  private readonly baseUrl = '/api/suppliers';

  /**
   * List all suppliers with optional filters
   */
  async list(filters?: ListSuppliersFilters): Promise<ApiListResponse<Supplier>> {
    return apiClient.get<ApiListResponse<Supplier>>(this.baseUrl, filters);
  }

  /**
   * Get a supplier by ID
   */
  async getById(id: number): Promise<ApiResponse<Supplier>> {
    return apiClient.get<ApiResponse<Supplier>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new supplier
   */
  async create(data: CreateSupplierDto): Promise<ApiResponse<Supplier>> {
    return apiClient.post<ApiResponse<Supplier>>(this.baseUrl, data);
  }

  /**
   * Update a supplier
   */
  async update(
    id: number,
    data: UpdateSupplierDto
  ): Promise<ApiResponse<Supplier>> {
    return apiClient.put<ApiResponse<Supplier>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete a supplier (soft delete)
   */
  async delete(id: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.delete<ApiResponse<{ success: boolean; message: string }>>(
      `${this.baseUrl}/${id}`
    );
  }
}

// Export singleton instance
export const suppliersService = new SuppliersService();
