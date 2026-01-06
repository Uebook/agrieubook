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
    
    console.log('API Request:', { url, method: options.method || 'GET', baseUrl: this.baseUrl });
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
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

  async deleteUser(id) {
    return this.request(`/api/users/${id}`, {
      method: 'DELETE',
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
    return this.request('/api/categories');
  }

  // Upload API
  async uploadFile(file, bucket, folder, authorId = null) {
    try {
      // Validate file object
      if (!file) {
        throw new Error('File is required');
      }

      const formData = new FormData();

      // Handle file URI - support both file:// and content:// URIs
      const fileUri = file.uri || file.path;
      if (!fileUri) {
        throw new Error('File URI is required');
      }

      const fileName = file.name || (fileUri ? fileUri.split('/').pop() : 'file.pdf');
      const fileType = file.type || 'application/pdf';

      // React Native FormData: Send file directly using uri, type, and name
      // React Native automatically reads the file from URI and sends it as binary data
      const fileObject = {
        uri: fileUri,
        type: fileType,
        name: fileName,
      };
      formData.append('file', fileObject);

      // Append metadata
      formData.append('fileName', fileName);
      formData.append('fileType', fileType);
      formData.append('bucket', bucket);
      if (folder) {
        formData.append('folder', folder);
      }
      // Append author_id if provided
      if (authorId) {
        formData.append('author_id', authorId);
      }

      const url = `${this.baseUrl}/api/upload`;
      
      console.log('Uploading file:', { 
        fileName, 
        fileType, 
        bucket, 
        folder, 
        uri: fileUri.substring(0, 50) + '...',
        url: url,
        baseUrl: this.baseUrl
      });
      
      // Send FormData - React Native handles file reading and sending automatically
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type - React Native FormData sets it automatically with boundary
        headers: {
          // Explicitly allow all headers for CORS
          'Accept': '*/*',
        },
      });

      console.log('Upload response:', { status: response.status, statusText: response.statusText });

      // Read response as text first (can only read once)
      const responseText = await response.text();
      console.log('Upload response text (raw, first 500 chars):', responseText.substring(0, 500));

      if (!response.ok) {
        console.error('Upload failed - HTTP status:', response.status);
        let error;
        try {
          error = JSON.parse(responseText);
          console.error('Upload failed - parsed error:', JSON.stringify(error, null, 2));
        } catch (parseError) {
          console.error('Upload failed - could not parse error as JSON:', responseText);
          error = { error: responseText || 'Upload failed' };
        }
        const errorMessage = error.error || error.message || `Upload failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      // Parse successful response
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Upload success response (parsed):', JSON.stringify(result, null, 2));
      } catch (parseError) {
        console.error('Failed to parse upload response as JSON:', responseText);
        throw new Error('Invalid JSON response from upload API: ' + parseError.message);
      }
      
      // Ensure we have the expected structure
      if (!result || typeof result !== 'object') {
        console.error('Upload response is not an object:', typeof result, result);
        throw new Error('Upload response is invalid: ' + typeof result);
      }
      
      // Check for error in response first
      if (result.error) {
        console.error('❌ Upload API returned error:', result.error);
        throw new Error(result.error || 'Upload failed');
      }

      // The API returns { success: true, url: ..., path: ... }
      // But check all possible formats
      if (result.url && typeof result.url === 'string') {
        console.log('✅ Found URL in result.url:', result.url);
        return result;
      } else if (result.data && result.data && result.data.url && typeof result.data.url === 'string') {
        console.log('✅ Found URL in result.data.url:', result.data.url);
        return { ...result, url: result.data.url };
      } else if (result.publicUrl && typeof result.publicUrl === 'string') {
        console.log('✅ Found URL in result.publicUrl:', result.publicUrl);
        return { ...result, url: result.publicUrl };
      } else {
        console.error('❌ Unexpected upload response structure - no URL found');
        console.error('Response object:', JSON.stringify(result, null, 2));
        console.error('Response keys:', Object.keys(result));
        console.error('Response type:', typeof result);
        throw new Error('Upload response missing URL field. Response: ' + JSON.stringify(result));
      }
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Upload error details:', {
        message: error.message,
        url: url,
        baseUrl: this.baseUrl,
        fileName,
        fileType,
        bucket,
        folder,
      });
      // Provide more helpful error messages
      if (error.message && error.message.includes('Network request failed')) {
        throw new Error(`Network error: Cannot connect to ${url}. Please check your internet connection and ensure the API server is accessible.`);
      }
      throw error;
    }
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

  // Curriculum API
  async getCurriculums(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    const query = queryParams.toString();
    return this.request(`/api/curriculum${query ? `?${query}` : ''}`);
  }

  // Reviews API
  async getReviews(bookId, params = {}) {
    const queryParams = new URLSearchParams({ bookId });
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    return this.request(`/api/reviews?${queryParams.toString()}`);
  }

  async createReview(bookId, userId, rating, comment) {
    return this.request('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ bookId, userId, rating, comment }),
    });
  }

  async updateReview(reviewId, rating, comment) {
    return this.request(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify({ rating, comment }),
    });
  }

  async deleteReview(reviewId) {
    return this.request(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;


