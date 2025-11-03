/**
 * Customers API Service
 * Handles all API calls related to customers
 */

import { apiClient } from '@/lib/api-client';
import type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  ListCustomersFilters,
  ApiResponse,
  ApiListResponse,
} from '@/types/customer';

export class CustomersService {
  private readonly baseUrl = '/api/customers';

  /**
   * List all customers with optional filters
   */
  async list(filters?: ListCustomersFilters): Promise<ApiListResponse<Customer>> {
    return apiClient.get<ApiListResponse<Customer>>(this.baseUrl, filters);
  }

  /**
   * Get a customer by ID
   */
  async getById(id: number): Promise<ApiResponse<Customer>> {
    return apiClient.get<ApiResponse<Customer>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new customer
   */
  async create(data: CreateCustomerDto): Promise<ApiResponse<Customer>> {
    return apiClient.post<ApiResponse<Customer>>(this.baseUrl, data);
  }

  /**
   * Update a customer
   */
  async update(
    id: number,
    data: UpdateCustomerDto
  ): Promise<ApiResponse<Customer>> {
    return apiClient.put<ApiResponse<Customer>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete a customer (soft delete)
   */
  async delete(id: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.delete<ApiResponse<{ success: boolean; message: string }>>(
      `${this.baseUrl}/${id}`
    );
  }
}

// Export singleton instance
export const customersService = new CustomersService();
