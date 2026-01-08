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

  // Upload API - SIMPLIFIED AND RELIABLE WITH RETRY LOGIC
  async uploadFile(file, bucket, folder, authorId = null, retryCount = 0) {
    const MAX_RETRIES = 2; // Retry up to 2 times (3 total attempts)
    
    // Validate inputs
    if (!file) {
      throw new Error('File is required');
    }

    // Handle file URI - support both file:// and content:// URIs (Android)
    const fileUri = file.uri || file.path;
    if (!fileUri) {
      throw new Error('File URI is required');
    }

    // Normalize URI - ensure it's in the correct format
    let normalizedUri = fileUri;
    if (!normalizedUri.startsWith('file://') && !normalizedUri.startsWith('content://') && !normalizedUri.startsWith('http://') && !normalizedUri.startsWith('https://')) {
      // If it's a relative path, make it absolute
      if (normalizedUri.startsWith('/')) {
        normalizedUri = 'file://' + normalizedUri;
      } else {
        normalizedUri = 'file:///' + normalizedUri;
      }
    }

    // Extract file name - ensure we have a valid name
    let fileName = file.name;
    if (!fileName) {
      // Extract from URI
      const uriParts = normalizedUri.split('/');
      fileName = uriParts[uriParts.length - 1] || 'file.pdf';
      // Remove query parameters if any
      fileName = fileName.split('?')[0];
      // Remove any encoding
      try {
        fileName = decodeURIComponent(fileName);
      } catch (e) {
        // If decoding fails, use as is
      }
    }
    
    // Use the actual file type, or fallback based on file extension
    let fileType = file.type;
    if (!fileType) {
      const ext = fileName.split('.').pop()?.toLowerCase();
      const mimeTypes = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'mp3': 'audio/mpeg',
        'm4a': 'audio/m4a',
        'wav': 'audio/wav',
      };
      fileType = mimeTypes[ext] || 'application/octet-stream';
    }

    // Create FormData - React Native format
    const formData = new FormData();
    
    // Append file - React Native FormData format
    // This matches the OkHttp pattern: addFormDataPart("file", "", RequestBody.create(...))
    // Use normalized URI
    formData.append('file', {
      uri: normalizedUri,
      type: fileType,
      name: fileName,
    } as any); // Type assertion for React Native FormData
    
    // Append other fields as strings
    formData.append('fileName', fileName);
    formData.append('fileType', fileType);
    formData.append('bucket', bucket);
    if (folder) {
      formData.append('folder', folder);
    }
    if (authorId) {
      formData.append('author_id', String(authorId));
    }
    
    // Log FormData structure for debugging
    console.log('📦 FormData created:', {
      fileName,
      fileType,
      bucket,
      folder: folder || 'none',
      authorId: authorId || 'none',
      originalUri: fileUri.substring(0, 50) + (fileUri.length > 50 ? '...' : ''),
      normalizedUri: normalizedUri.substring(0, 50) + (normalizedUri.length > 50 ? '...' : ''),
      uriScheme: normalizedUri.split(':')[0],
    });

    const url = `${this.baseUrl}/api/upload`;
    
    console.log(`📤 Uploading file (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, { fileName, fileType, bucket, folder });

    try {
      // Make the request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout for large files
      
      let response;
      try {
        // React Native FormData automatically sets Content-Type with boundary
        // Do NOT set Content-Type header manually - let React Native handle it
        response = await fetch(url, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': '*/*',
            // Explicitly do NOT set Content-Type - React Native FormData sets it automatically
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        // Log response headers for debugging
        console.log('📥 Response headers:', {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length'),
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error(`❌ Fetch error (attempt ${retryCount + 1}):`, fetchError);
        
        // Handle different types of fetch errors
        if (fetchError.name === 'AbortError') {
          // Retry on timeout if we have retries left
          if (retryCount < MAX_RETRIES) {
            console.log(`⏳ Upload timeout, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
            return this.uploadFile(file, bucket, folder, authorId, retryCount + 1);
          }
          throw new Error('Upload timeout: The request took too long. Please try again.');
        }
        
        // Retry on network errors if we have retries left
        if (fetchError.message && (fetchError.message.includes('Network request failed') || fetchError.message.includes('Failed to fetch'))) {
          if (retryCount < MAX_RETRIES) {
            console.log(`🔄 Network error, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
            return this.uploadFile(file, bucket, folder, authorId, retryCount + 1);
          }
          throw new Error('Network error: Cannot reach the server. Please check your internet connection and try again.');
        }
        throw fetchError;
      }

      // Read response as text
      const responseText = await response.text();
      console.log(`📥 Upload response status (attempt ${retryCount + 1}):`, response.status);
      console.log('📥 Upload response text (first 200 chars):', responseText.substring(0, 200));

      // Parse JSON response
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', responseText);
        throw new Error(`Server returned invalid response. Status: ${response.status}`);
      }

      // Check for HTTP errors
      if (!response.ok) {
        const errorMsg = result.error || result.message || `Upload failed with status ${response.status}`;
        
        // Retry on 5xx errors (server errors) if we have retries left
        if (response.status >= 500 && retryCount < MAX_RETRIES) {
          console.log(`🔄 Server error ${response.status}, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.uploadFile(file, bucket, folder, authorId, retryCount + 1);
        }
        
        throw new Error(errorMsg);
      }

      // Check for error in response body
      if (result.error) {
        throw new Error(result.error);
      }

      // Extract URL - API should always return { success: true, url: string }
      const uploadUrl = result.url || result.publicUrl || result.signedUrl;
      
      if (!uploadUrl || typeof uploadUrl !== 'string') {
        console.error('❌ No URL in response:', JSON.stringify(result, null, 2));
        throw new Error('Upload succeeded but no URL returned. Please try again.');
      }

      console.log('✅ Upload successful, URL:', uploadUrl.substring(0, 50) + '...');

      // Return consistent structure
      return {
        success: true,
        url: uploadUrl,
        path: result.path || null,
        publicUrl: result.publicUrl || uploadUrl,
        signedUrl: result.signedUrl || null,
      };
    } catch (error) {
      console.error(`❌ Upload error (attempt ${retryCount + 1}):`, error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      
      // If this is a retryable error and we haven't exhausted retries, retry
      const isRetryable = error.message && (
        error.message.includes('Network request failed') || 
        error.message.includes('Failed to fetch') || 
        error.message.includes('timeout') ||
        error.message.includes('Cannot reach')
      );
      
      if (isRetryable && retryCount < MAX_RETRIES) {
        console.log(`🔄 Retryable error detected, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.uploadFile(file, bucket, folder, authorId, retryCount + 1);
      }
      
      // Provide user-friendly error messages
      if (error.message && (error.message.includes('Network request failed') || error.message.includes('Failed to fetch') || error.message.includes('Cannot reach'))) {
        throw new Error('Network error: Please check your internet connection and try again.');
      }
      
      // Re-throw with original message
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

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  // Orders API
  async getOrders(userId) {
    return this.request(`/api/orders?user_id=${userId}`);
  }

  async createOrder(data) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
    return this.request('/api/wishlist', {
      method: 'DELETE',
      body: JSON.stringify({ user_id: userId, book_id: bookId }),
    });
  }

  // Notifications API
  async getNotifications(userId) {
    return this.request(`/api/notifications?user_id=${userId}`);
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/api/notifications/${notificationId}`, {
      method: 'PUT',
      body: JSON.stringify({ read: true }),
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

  async getYouTubeChannel(id) {
    return this.request(`/api/youtube-channels/${id}`);
  }

  // Purchases API
  async getPurchases(userId) {
    return this.request(`/api/purchases?user_id=${userId}`);
  }

  // Razorpay API
  async createRazorpayOrder(data) {
    return this.request('/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyRazorpayPayment(data) {
    return this.request('/api/payments/verify-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Curriculum API
  async getCurriculum() {
    return this.request('/api/curriculum');
  }

  // Reviews API
  async getReviews(bookId) {
    return this.request(`/api/reviews?book_id=${bookId}`);
  }

  async createReview(data) {
    return this.request('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

const apiClient = new ApiClient();
export default apiClient;
