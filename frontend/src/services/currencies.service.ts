import type {
  Currency,
  CreateCurrencyDto,
  UpdateCurrencyDto,
  ListCurrenciesFilters,
  ApiResponse,
  ApiListResponse,
} from '@/types/currency';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Service for managing currencies
 */
class CurrenciesService {
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-user-id': '1', // TODO: Get from auth context
    };
  }

  /**
   * List currencies with pagination and filters
   */
  async list(filters?: ListCurrenciesFilters): Promise<ApiListResponse<Currency>> {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.active !== undefined) params.append('active', filters.active.toString());

    const response = await fetch(`${API_URL}/currencies?${params.toString()}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch currencies');
    }

    return response.json();
  }

  /**
   * Get all active currencies (for dropdowns)
   */
  async getAllActive(): Promise<ApiResponse<Currency[]>> {
    const response = await fetch(`${API_URL}/currencies/active`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch active currencies');
    }

    return response.json();
  }

  /**
   * Get a currency by code
   */
  async getByCode(code: string): Promise<ApiResponse<Currency>> {
    const response = await fetch(`${API_URL}/currencies/${code}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch currency ${code}`);
    }

    return response.json();
  }

  /**
   * Create a new currency
   */
  async create(data: CreateCurrencyDto): Promise<ApiResponse<Currency>> {
    const response = await fetch(`${API_URL}/currencies`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create currency');
    }

    return response.json();
  }

  /**
   * Update a currency
   */
  async update(code: string, data: UpdateCurrencyDto): Promise<ApiResponse<Currency>> {
    const response = await fetch(`${API_URL}/currencies/${code}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to update currency');
    }

    return response.json();
  }

  /**
   * Delete a currency
   */
  async delete(code: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const response = await fetch(`${API_URL}/currencies/${code}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete currency');
    }

    return response.json();
  }
}

// Export singleton instance
export const currenciesService = new CurrenciesService();
