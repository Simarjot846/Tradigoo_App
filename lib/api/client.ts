/**
 * API Client
 * Centralized API request handling with error management
 */

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Make API request with error handling
 */
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new APIError(
        error.message || 'Request failed',
        response.status,
        error.code
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
}

/**
 * GET request
 */
export async function get<T>(url: string, options?: RequestInit): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'GET' });
}

/**
 * POST request
 */
export async function post<T>(
  url: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request
 */
export async function put<T>(
  url: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 */
export async function del<T>(url: string, options?: RequestInit): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'DELETE' });
}
