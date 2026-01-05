/**
 * API Client for Admin Panel
 * Handles all API requests to Next.js API routes
 */

const API_BASE_URL = 
  typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Books API
  async getBooks(params?: {
    page?: number;
    limit?: number;
    category?: string;
    author?: string;
    language?: string;
    search?: string;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ books: any[]; pagination: any }>(
      `/api/books${query ? `?${query}` : ''}`
    );
  }

  async getBook(id: string) {
    return this.request<{ book: any }>(`/api/books/${id}`);
  }

  async createBook(data: any) {
    return this.request<{ book: any }>('/api/books', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBook(id: string, data: any) {
    return this.request<{ book: any }>(`/api/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBook(id: string) {
    return this.request<{ success: boolean }>(`/api/books/${id}`, {
      method: 'DELETE',
    });
  }

  async getBookDownloadUrl(id: string) {
    return this.request<{ downloadUrl: string; expiresAt: string }>(
      `/api/books/${id}/download`
    );
  }

  // Authors API
  async getAuthors(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ authors: any[]; pagination: any }>(
      `/api/authors${query ? `?${query}` : ''}`
    );
  }

  async getAuthor(id: string) {
    return this.request<{ author: any }>(`/api/authors/${id}`);
  }

  async createAuthor(data: any) {
    return this.request<{ author: any }>('/api/authors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAuthor(id: string, data: any) {
    return this.request<{ author: any }>(`/api/authors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAuthor(id: string) {
    return this.request<{ success: boolean }>(`/api/authors/${id}`, {
      method: 'DELETE',
    });
  }

  // Users API
  async getUsers(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ users: any[]; pagination: any }>(
      `/api/users${query ? `?${query}` : ''}`
    );
  }

  async getUser(id: string) {
    return this.request<{ user: any }>(`/api/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.request<{ user: any }>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Audio Books API
  async getAudioBooks(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ audioBooks: any[]; pagination: any }>(
      `/api/audio-books${query ? `?${query}` : ''}`
    );
  }

  async getAudioBook(id: string) {
    return this.request<{ audioBook: any }>(`/api/audio-books/${id}`);
  }

  async createAudioBook(data: any) {
    return this.request<{ audioBook: any }>('/api/audio-books', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAudioBook(id: string, data: any) {
    return this.request<{ audioBook: any }>(`/api/audio-books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAudioBook(id: string) {
    return this.request<{ success: boolean }>(`/api/audio-books/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories API
  async getCategories() {
    return this.request<{ categories: any[] }>('/api/categories');
  }

  async getCategory(id: string) {
    return this.request<{ category: any }>(`/api/categories/${id}`);
  }

  async createCategory(data: {
    name: string;
    description?: string;
    icon?: string;
    status?: string;
  }) {
    return this.request<{ category: any }>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: {
    name?: string;
    description?: string;
    icon?: string;
    status?: string;
  }) {
    return this.request<{ category: any }>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Upload API
  async getUploadUrl(data: { fileName: string; fileType: string; bucket: string; folder?: string }) {
    return this.request<{ uploadUrl: string; path: string; token: string; expiresAt: string }>(
      '/api/upload',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async uploadFile(file: File, bucket: string, folder?: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    if (folder) {
      formData.append('folder', folder);
    }

    const url = `${this.baseUrl}/api/upload`;
    const response = await fetch(url, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return await response.json();
  }

  // Dashboard API
  async getDashboardStats(startDate?: string, endDate?: string) {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    const query = queryParams.toString();
    return this.request<{
      totalBooks: number;
      totalAudioBooks: number;
      totalAuthors: number;
      totalUsers: number;
      totalRevenue: number;
      totalPayments: number;
      pendingBooks: number;
      pendingAudioBooks: number;
      activeUsers: number;
      authorRevenue: any[];
    }>(`/api/dashboard${query ? `?${query}` : ''}`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;

