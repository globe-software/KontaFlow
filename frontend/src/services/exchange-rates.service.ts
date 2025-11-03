import {
  ExchangeRate,
  CreateExchangeRateDto,
  UpdateExchangeRateDto,
  ListExchangeRatesFilters,
  ApiResponse,
  ApiListResponse,
} from '@/types/exchange-rate';

class ExchangeRatesService {
  private baseUrl = '/api/exchange-rates';

  async list(filters?: ListExchangeRatesFilters): Promise<ApiListResponse<ExchangeRate>> {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sourceCurrency) params.append('sourceCurrency', filters.sourceCurrency);
    if (filters?.targetCurrency) params.append('targetCurrency', filters.targetCurrency);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    return response.json();
  }

  async getById(id: number): Promise<ApiResponse<ExchangeRate>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    return response.json();
  }

  async create(data: CreateExchangeRateDto): Promise<ApiResponse<ExchangeRate>> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  async update(id: number, data: UpdateExchangeRateDto): Promise<ApiResponse<ExchangeRate>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return response.json();
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete exchange rate');
    }
  }
}

export const exchangeRatesService = new ExchangeRatesService();
