/**
 * API Client for Mobile App
 * Handles all API requests to Next.js API routes
 */

// API Base URL - Using Vercel deployment URL
// Production URL: https://admin-orcin-omega.vercel.app
// Using Vercel URL for both development and production
const API_BASE_URL = 'https://admin-orcin-omega.vercel.app';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config = {
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
  async getBooks(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    const query = queryParams.toString();
    return this.request(`/api/books${query ? `?${query}` : ''}`);
  }

  async getBook(id) {
    return this.request(`/api/books/${id}`);
  }

  async getBookDownloadUrl(id) {
    return this.request(`/api/books/${id}/download`);
  }

  async createBook(data) {
    return this.request('/api/books', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBook(id, data) {
    return this.request(`/api/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBook(id) {
    return this.request(`/api/books/${id}`, {
      method: 'DELETE',
    });
  }

  async createAudioBook(data) {
    return this.request('/api/audio-books', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAudioBook(id, data) {
    return this.request(`/api/audio-books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Authors API
  async getAuthors(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    const query = queryParams.toString();
    return this.request(`/api/authors${query ? `?${query}` : ''}`);
  }

  async getAuthor(id) {
    return this.request(`/api/authors/${id}`);
  }

  // Users API
  async getUsers(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    const query = queryParams.toString();
    return this.request(`/api/users${query ? `?${query}` : ''}`);
  }

  async getUser(id) {
    return this.request(`/api/users/${id}`);
  }

  async updateUser(id, data) {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Audio Books API
  async getAudioBooks(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    const query = queryParams.toString();
    return this.request(`/api/audio-books${query ? `?${query}` : ''}`);
  }

  async getAudioBook(id) {
    return this.request(`/api/audio-books/${id}`);
  }

  // Categories API (if you create one)
  async getCategories() {
    // For now, return empty or use dummy data
    // You can create /api/categories endpoint later
    return { categories: [] };
  }

  // Upload API
  async uploadFile(file, bucket, folder) {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri || file.path,
      type: file.type || 'application/pdf',
      name: file.name || 'file.pdf',
    });
    formData.append('bucket', bucket);
    if (folder) {
      formData.append('folder', folder);
    }

    const url = `${this.baseUrl}/api/upload`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return await response.json();
  }

  // Search API (if you create one)
  async searchBooks(query, filters = {}) {
    return this.getBooks({ search: query, ...filters });
  }

  // Auth API
  async sendOTP(mobile) {
    return this.request('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  }

  async verifyOTP(mobile, otp) {
    return this.request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
  }

  async login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Orders API
  async getOrders(userId, params = {}) {
    const queryParams = new URLSearchParams({ user_id: userId });
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    return this.request(`/api/orders?${queryParams.toString()}`);
  }

  // Wishlist API
  async getWishlist(userId) {
    return this.request(`/api/wishlist?user_id=${userId}`);
  }

  async addToWishlist(userId, bookId) {
    return this.request('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, book_id: bookId }),
    });
  }

  async removeFromWishlist(userId, bookId) {
    return this.request(`/api/wishlist?user_id=${userId}&book_id=${bookId}`, {
      method: 'DELETE',
    });
  }

  // Notifications API
  async getNotifications(userId, filter = 'all') {
    return this.request(`/api/notifications?user_id=${userId}&filter=${filter}`);
  }

  async markNotificationAsRead(notificationId) {
    return this.request('/api/notifications', {
      method: 'PUT',
      body: JSON.stringify({ notification_id: notificationId }),
    });
  }

  async markAllNotificationsAsRead(userId) {
    return this.request('/api/notifications', {
      method: 'PUT',
      body: JSON.stringify({ user_id: userId, mark_all: true }),
    });
  }

  // YouTube Channels API
  async getYouTubeChannels(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    const query = queryParams.toString();
    return this.request(`/api/youtube-channels${query ? `?${query}` : ''}`);
  }

  // Purchase API
  async purchaseBook(userId, bookId, paymentMethod, transactionId) {
    return this.request('/api/purchase', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        book_id: bookId,
        payment_method: paymentMethod,
        transaction_id: transactionId,
      }),
    });
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;


