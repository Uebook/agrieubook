/**
 * API Client for Admin Panel
 * Handles all API requests to Next.js API routes
 */

const API_BASE_URL =
  typeof window !== 'undefined'
    ? window.location.origin + '/admin'
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000/admin';

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
        const errorMessage = error.error || error.message || `HTTP error! status: ${response.status}`;
        const apiError: any = new Error(errorMessage);
        apiError.status = response.status;
        apiError.details = error.details;
        throw apiError;
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
  async getAudioBooks(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
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
  async getCategories(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ categories: any[]; pagination: any }>(
      `/api/categories${query ? `?${query}` : ''}`
    );
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
    formData.append('fileName', file.name);
    formData.append('fileType', file.type || 'application/octet-stream');

    const url = `${this.baseUrl}/api/upload`;
    const response = await fetch(url, {
      method: 'POST',
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
      totalPlatformCommission: number;
      totalGST: number;
      totalAuthorEarnings: number;
      platformProfit: number;
      pendingBooks: number;
      pendingAudioBooks: number;
      activeUsers: number;
      authorRevenue: any[];
    }>(`/api/dashboard${query ? `?${query}` : ''}`);
  }

  // Curriculum API
  async getCurriculums(params?: { page?: number; limit?: number; state?: string; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ curriculums: any[]; pagination: any }>(
      `/api/curriculum${query ? `?${query}` : ''}`
    );
  }

  async getCurriculum(id: string) {
    return this.request<{ curriculum: any }>(`/api/curriculum/${id}`);
  }

  async createCurriculum(data: any) {
    return this.request<{ curriculum: any }>('/api/curriculum', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCurriculum(id: string, data: any) {
    return this.request<{ curriculum: any }>(`/api/curriculum/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCurriculum(id: string) {
    return this.request<{ success: boolean }>(`/api/curriculum/${id}`, {
      method: 'DELETE',
    });
  }

  // Settings API
  async getSettings() {
    return this.request<{
      settings?: {
        platform_name: string;
        support_email: string;
        auto_approve_books: boolean;
        email_notifications: boolean;
      };
      platform_name?: string;
      support_email?: string;
      auto_approve_books?: boolean;
      email_notifications?: boolean;
    }>('/api/settings');
  }

  async updateSettings(data: {
    platform_name?: string;
    support_email?: string;
    auto_approve_books?: boolean;
    email_notifications?: boolean;
  }) {
    return this.request<{ settings: any }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Profile API
  async getProfile() {
    return this.request<{ profile: any }>('/api/profile');
  }

  async updateProfile(data: {
    name?: string;
    email?: string;
    current_password?: string;
    new_password?: string;
  }) {
    return this.request<{ profile: any }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Subscriptions API
  async getSubscriptions(params?: {
    page?: number;
    limit?: number;
    type?: string;
    is_active?: boolean;
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
    return this.request<{ subscriptionTypes: any[]; pagination: any }>(
      `/api/subscriptions${query ? `?${query}` : ''}`
    );
  }

  async getSubscription(id: string) {
    return this.request<{ subscriptionType: any }>(`/api/subscriptions/${id}`);
  }

  async createSubscription(data: {
    name: string;
    type: string;
    description?: string | null;
    price: number;
    duration_days?: number | null;
    is_active?: boolean;
  }) {
    return this.request<{ success: boolean; subscriptionType: any }>('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubscription(id: string, data: {
    name?: string;
    type?: string;
    description?: string | null;
    price?: number;
    duration_days?: number | null;
    is_active?: boolean;
  }) {
    return this.request<{ success: boolean; subscriptionType: any }>(`/api/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSubscription(id: string) {
    return this.request<{ success: boolean }>(`/api/subscriptions/${id}`, {
      method: 'DELETE',
    });
  }

  // YouTube Channels API
  async getYouTubeChannels(params?: { page?: number; limit?: number; category?: string; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const query = queryParams.toString();
    return this.request<{ channels: any[]; pagination: any }>(
      `/api/youtube-channels${query ? `?${query}` : ''}`
    );
  }

  async getYouTubeChannel(id: string) {
    return this.request<{ channel: any }>(`/api/youtube-channels/${id}`);
  }

  async createYouTubeChannel(data: {
    name: string;
    description?: string;
    channel_url: string;
    thumbnail_url?: string;
    subscriber_count?: number;
    video_count?: number;
    verified?: boolean;
    category_ids?: string[];
  }) {
    return this.request<{ success: boolean; channel: any }>('/api/youtube-channels', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateYouTubeChannel(id: string, data: {
    name?: string;
    description?: string;
    channel_url?: string;
    thumbnail_url?: string;
    subscriber_count?: number;
    video_count?: number;
    verified?: boolean;
    category_ids?: string[];
    is_active?: boolean;
  }) {
    return this.request<{ channel: any }>(`/api/youtube-channels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteYouTubeChannel(id: string) {
    return this.request<{ success: boolean }>(`/api/youtube-channels/${id}`, {
      method: 'DELETE',
    });
  }

  // Auth API
  async login(email: string, password: string) {
    return this.request<{ success: boolean; user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;

