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
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          // If response is not JSON, get text
          const text = await response.text();
          errorData = { error: text || 'Request failed' };
        }
        
        const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.details = errorData.details;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      // Re-throw with more context if it's a network error
      if (error.message === 'Network request failed' || error.name === 'TypeError') {
        const networkError = new Error('Network error: Please check your internet connection');
        networkError.originalError = error;
        throw networkError;
      }
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
    try {
      return await this.request(`/api/users/${id}`);
    } catch (error) {
      // If user not found (404), return null instead of throwing
      // This allows the app to continue without user data
      if (error.status === 404) {
        console.warn(`User ${id} not found, returning null`);
        return { user: null };
      }
      // Re-throw other errors
      throw error;
    }
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

  async getAudioBookSignedUrl(id) {
    return this.request(`/api/audio-books/${id}/audio`);
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
      let response;
      try {
        response = await fetch(url, {
          method: 'POST',
          body: formData,
          // Do NOT set Content-Type - React Native FormData sets it automatically with boundary
          headers: {
            // Explicitly allow all headers for CORS
            'Accept': '*/*',
          },
        });
      } catch (fetchError) {
        // Network error - fetch failed completely
        console.error('Network error during fetch:', fetchError);
        const networkErrorMessage = fetchError?.message || 'Network request failed';
        throw new Error(`Network error: ${networkErrorMessage}. Please check your internet connection and try again.`);
      }

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
        console.log('📥 Upload response (parsed):', JSON.stringify(result, null, 2));
        console.log('📥 Upload response type:', typeof result);
        console.log('📥 Upload response keys:', result && typeof result === 'object' ? Object.keys(result) : 'N/A');
        console.log('📥 Upload response has url?', result && typeof result === 'object' ? ('url' in result) : false);
      } catch (parseError) {
        console.error('❌ Failed to parse upload response as JSON:', responseText);
        throw new Error('Invalid JSON response from upload API: ' + parseError.message);
      }
      
      // Ensure we have the expected structure
      if (!result || typeof result !== 'object') {
        console.error('❌ Upload response is not an object:', typeof result, result);
        throw new Error('Upload response is invalid: ' + typeof result);
      }
      
      // Check for error in response first - use 'in' operator to safely check
      if ('error' in result && result.error) {
        console.error('❌ Upload API returned error:', result.error);
        const errorMsg = typeof result.error === 'string' ? result.error : 'Upload failed';
        throw new Error(errorMsg);
      }

      // The API returns { success: true, url: ..., path: ... }
      // Check all possible formats and ensure we return a consistent structure
      // Use 'in' operator to safely check for properties to avoid ReferenceError
      let finalUrl = null;
      
      // Use bracket notation consistently to avoid any potential ReferenceError
      if ('url' in result) {
        try {
          const urlValue = result['url'];
          if (urlValue && typeof urlValue === 'string') {
            console.log('✅ Found URL in result.url:', urlValue);
            finalUrl = urlValue;
          }
        } catch (accessError) {
          console.warn('Could not access result.url:', accessError);
        }
      }
      
      if (!finalUrl && 'data' in result && result['data'] && typeof result['data'] === 'object' && result['data'] !== null) {
        try {
          const data = result['data'];
          if ('url' in data) {
            const urlValue = data['url'];
            if (urlValue && typeof urlValue === 'string') {
              console.log('✅ Found URL in result.data.url:', urlValue);
              finalUrl = urlValue;
            }
          }
        } catch (accessError) {
          console.warn('Could not access result.data.url:', accessError);
        }
      }
      
      if (!finalUrl && 'publicUrl' in result) {
        try {
          const urlValue = result['publicUrl'];
          if (urlValue && typeof urlValue === 'string') {
            console.log('✅ Found URL in result.publicUrl:', urlValue);
            finalUrl = urlValue;
          }
        } catch (accessError) {
          console.warn('Could not access result.publicUrl:', accessError);
        }
      }
      
      if (!finalUrl && 'signedUrl' in result) {
        try {
          const urlValue = result['signedUrl'];
          if (urlValue && typeof urlValue === 'string') {
            console.log('✅ Found URL in result.signedUrl:', urlValue);
            finalUrl = urlValue;
          }
        } catch (accessError) {
          console.warn('Could not access result.signedUrl:', accessError);
        }
      }
      
      if (finalUrl) {
        // Return consistent structure with url property
        // Use bracket notation and 'in' operator to safely access all properties
        let pathValue = null;
        let publicUrlValue = finalUrl;
        let signedUrlValue = null;
        
        try {
          if ('path' in result) {
            pathValue = result['path'] || null;
          }
        } catch (e) {
          console.warn('Could not access result.path:', e);
        }
        
        try {
          if ('publicUrl' in result) {
            publicUrlValue = result['publicUrl'] || finalUrl;
          }
        } catch (e) {
          console.warn('Could not access result.publicUrl:', e);
        }
        
        try {
          if ('signedUrl' in result) {
            signedUrlValue = result['signedUrl'] || null;
          }
        } catch (e) {
          console.warn('Could not access result.signedUrl:', e);
        }
        
        return {
          success: true,
          url: finalUrl,
          path: pathValue,
          publicUrl: publicUrlValue,
          signedUrl: signedUrlValue,
        };
      } else {
        console.error('❌ Unexpected upload response structure - no URL found');
        console.error('Response object:', JSON.stringify(result, null, 2));
        console.error('Response keys:', Object.keys(result));
        console.error('Response type:', typeof result);
        throw new Error('Upload response missing URL field. Response: ' + JSON.stringify(result));
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Extract error message safely
      const errorMessage = error?.message || error?.error || 'Unknown error';
      const errorName = error?.name || 'Unknown';
      
      // Check for network errors
      const isNetworkError = 
        errorMessage.includes('Network request failed') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('Network error') ||
        (errorName === 'TypeError' && errorMessage.includes('Network')) ||
        (errorName === 'TypeError' && errorMessage.includes('fetch'));
      
      console.error('Upload error details:', {
        message: errorMessage,
        name: errorName,
        url: url,
        baseUrl: this.baseUrl,
        fileName,
        fileType,
        bucket,
        folder,
        isNetworkError: isNetworkError,
      });
      
      // If it's a network error, provide a more helpful message
      if (isNetworkError) {
        throw new Error(`Network error: Unable to reach upload server. Please check your internet connection and try again.`);
      }
      
      // For other errors, create a new Error with a safe message
      // Never re-throw the original error as it might have unexpected properties
      const safeErrorMessage = errorMessage || 'Upload failed. Please try again.';
      throw new Error(safeErrorMessage);
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

  // Purchase API - Create purchase record directly (no verification)
  async purchaseBook(userId, bookId, paymentMethod, transactionId, audioBookId = null, amount = null) {
    return this.request('/api/purchase', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        book_id: bookId || null,
        audio_book_id: audioBookId || null,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        amount: amount,
      }),
    });
  }

  // Razorpay API
  async createRazorpayOrder(amount, bookId, audioBookId, userId) {
    return this.request('/api/payments/razorpay/order', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        currency: 'INR',
        bookId,
        audioBookId,
        userId,
      }),
    });
  }

  async verifyRazorpayPayment(orderId, paymentId, signature, userId, bookId, audioBookId, amount) {
    return this.request('/api/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        userId,
        bookId,
        audioBookId,
        amount,
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


