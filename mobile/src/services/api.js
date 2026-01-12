/**
 * API Client for Mobile App
 * Handles all API requests to Next.js API routes
 */

import axios from 'axios';

// API Base URL - Configure based on environment
// Default: Use Vercel production URL (works on both emulator and physical devices)
// To use local server: Set USE_LOCAL_SERVER = true
const USE_LOCAL_SERVER = false; // Set to true to use local development server

const API_BASE_URL = USE_LOCAL_SERVER
  ? (__DEV__ 
      ? 'http://10.0.2.2:3000' // Android emulator - use 10.0.2.2
      : 'http://YOUR_IP:3000') // Physical device - replace YOUR_IP with your computer's IP (e.g., 192.168.1.100)
  : 'https://admin-orcin-omega.vercel.app'; // Production Vercel URL (default)

// Log the API URL being used for debugging
console.log('🔗 API Configuration:', {
  baseUrl: API_BASE_URL,
  usingLocalServer: USE_LOCAL_SERVER,
  isDev: __DEV__,
});

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || 'GET';
    
    console.log('API Request (axios):', { url, method, baseUrl: this.baseUrl });
    
    try {
      const config = {
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          ...options.headers,
        },
        timeout: 30000, // 30 second timeout
      };

      // Add body for POST/PUT/PATCH requests
      if (options.body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      console.error(`API Error details:`, {
        url,
        method,
        baseUrl: this.baseUrl,
        errorName: error.name,
        errorMessage: error.message,
        usingLocalServer: USE_LOCAL_SERVER,
      });
      
      // Handle axios errors
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data || {};
        const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${error.response.status}`;
        const apiError = new Error(errorMessage);
        apiError.status = error.response.status;
        apiError.details = errorData.details;
        throw apiError;
      } else if (error.request) {
        // Request was made but no response received
        const networkError = new Error(
          `Network error: Cannot reach ${url}\n\n` +
          `Please check:\n` +
          `1. Internet connection\n` +
          `2. If ${this.baseUrl} is accessible\n` +
          `3. API server status`
        );
        networkError.originalError = error;
        throw networkError;
      } else if (error.code === 'ECONNABORTED') {
        throw new Error(`Request timeout: ${url}. Please check your internet connection.`);
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

  // Create book with FormData (files + metadata) or JSON (metadata only)
  async createBook(data, formData = null) {
    if (formData) {
      // Use FormData for single API call with files
      const url = `${this.baseUrl}/api/books`;
      console.log('📤 Creating book with FormData (axios)...');
      console.log('📤 Request URL:', url);
      console.log('📤 FormData keys:', formData._parts ? formData._parts.map((p) => p[0]) : 'unknown');
      
      try {
        // Log FormData structure for debugging
        if (formData._parts) {
          console.log('📦 FormData structure:', {
            partsCount: formData._parts.length,
            parts: formData._parts.map((p) => ({
              key: p[0],
              valueType: typeof p[1],
              valueIsObject: typeof p[1] === 'object',
              valueKeys: typeof p[1] === 'object' ? Object.keys(p[1] || {}) : [],
            })),
          });
        }
        
        const response = await axios.post(url, formData, {
          headers: {
            'Accept': '*/*',
            // Do NOT set Content-Type - axios will automatically set it with boundary for FormData
          },
          timeout: 120000, // 2 minute timeout for large files
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });
        
        console.log('✅ Book created successfully:', {
          bookId: response.data?.book?.id,
          title: response.data?.book?.title,
          hasCoverImage: !!response.data?.book?.cover_image_url,
          hasPdf: !!response.data?.book?.pdf_url,
        });
        return response.data;
      } catch (error) {
        console.error('❌ Error creating book with FormData:', error);
        
        if (error.response) {
          const errorData = error.response.data || {};
          const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${error.response.status}`;
          const apiError = new Error(errorMessage);
          apiError.status = error.response.status;
          throw apiError;
        } else if (error.request) {
          const networkError = new Error(
            `Network error: Cannot reach the server at ${url}\n\n` +
            `Current configuration: ${this.baseUrl.includes('localhost') ? 'LOCAL' : 'VERCEL PRODUCTION'}\n\n` +
            `Troubleshooting:\n` +
            `1. Check internet connection\n` +
            `2. Check if ${this.baseUrl} is accessible\n` +
            `3. For Vercel: Check function logs at vercel.com/dashboard\n` +
            `4. Try uploading without files first to test connection\n` +
            `5. Request might be too large - try smaller files\n` +
            `6. Check Vercel function timeout (max 60s on Pro plan)`
          );
          networkError.originalError = error;
          throw networkError;
        } else if (error.code === 'ECONNABORTED') {
          throw new Error(`Request timeout: ${url}. The request took too long (120s). Try with smaller files or check Vercel function timeout.`);
        }
        
        throw error;
      }
    } else {
      // Use JSON for metadata only (backward compatible)
      return this.request('/api/books', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
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

  // Update profile with FormData (supports file upload)
  // Uses XMLHttpRequest for file uploads (more reliable in React Native) with axios fallback
  async updateProfile(formData) {
    const url = `${this.baseUrl}/api/profile/update`;
    
    console.log('📤 Updating profile:', {
      url,
      baseUrl: this.baseUrl,
      hasFormData: !!formData,
      usingLocalServer: USE_LOCAL_SERVER,
      isDev: __DEV__,
    });
    
    // Log FormData structure for debugging
    if (formData._parts) {
      console.log('📦 FormData structure:', formData._parts.map((part, index) => ({
        index,
        key: part[0],
        valueType: typeof part[1],
        valueIsObject: typeof part[1] === 'object',
        valueKeys: typeof part[1] === 'object' ? Object.keys(part[1] || {}) : [],
        valuePreview: typeof part[1] === 'string' 
          ? part[1].substring(0, 50) 
          : typeof part[1] === 'object' && part[1]?.uri
          ? `{uri: ${part[1].uri.substring(0, 30)}..., type: ${part[1].type}, name: ${part[1].name}}`
          : typeof part[1] === 'object' && part[1]?.path
          ? `{path: ${part[1].path.substring(0, 30)}..., type: ${part[1].type || part[1].mime}, name: ${part[1].name || part[1].filename}}`
          : String(part[1]).substring(0, 50),
      })));
    }
    
    // First, test connectivity with an OPTIONS request (CORS preflight)
    try {
      console.log('🔍 Testing endpoint connectivity...');
      await axios.options(url, {
        timeout: 5000,
        validateStatus: () => true, // Don't throw on any status
      });
      console.log('✅ Endpoint is reachable');
    } catch (testError) {
      console.warn('⚠️ Connectivity test failed, but continuing anyway:', testError.message);
    }
    
    try {
      // Use XMLHttpRequest for FormData with files (more reliable in React Native)
      // React Native's XMLHttpRequest handles FormData with file URIs better than axios
      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.open('POST', url);
        xhr.setRequestHeader('Accept', '*/*');
        // Do NOT set Content-Type - React Native FormData sets it automatically with boundary
        
        xhr.onload = () => {
          const responseText = xhr.responseText;
          
          console.log('✅ XMLHttpRequest completed:', {
            status: xhr.status,
            statusText: xhr.statusText,
            responseLength: responseText?.length,
          });
          
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(responseText);
              resolve(data);
            } catch (parseError) {
              reject(new Error('Invalid JSON response from server'));
            }
          } else {
            let errorData;
            try {
              errorData = JSON.parse(responseText);
            } catch (parseError) {
              errorData = { error: responseText || 'Request failed' };
            }
            const error = new Error(errorData.error || errorData.message || `HTTP error! status: ${xhr.status}`);
            error.status = xhr.status;
            error.details = errorData.details;
            reject(error);
          }
        };
        
        xhr.onerror = (error) => {
          console.error('❌ XMLHttpRequest onerror:', {
            readyState: xhr.readyState,
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText?.substring(0, 200),
            error: error,
          });
          reject(new Error('Network request failed - XMLHttpRequest error'));
        };
        
        xhr.ontimeout = () => {
          console.error('❌ XMLHttpRequest timeout after 90s');
          reject(new Error('Request timeout'));
        };
        
        xhr.timeout = 90000; // 90 seconds
        
        console.log('📡 Sending XMLHttpRequest POST request to:', url);
        xhr.send(formData);
      });
      
      console.log('✅ Profile update successful');
      return response;
    } catch (xhrError) {
      console.warn('⚠️ XMLHttpRequest failed, trying axios fallback...', xhrError.message);
      
      // Fallback to axios if XMLHttpRequest fails
      try {
        const response = await axios.post(url, formData, {
          headers: {
            'Accept': '*/*',
            // Do NOT set Content-Type - axios will automatically set it with boundary for FormData
          },
          timeout: 90000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });
        
        console.log('✅ Axios fallback successful');
        return response.data;
      } catch (axiosError) {
        console.error('❌ Both XMLHttpRequest and axios failed');
        
        if (axiosError.response) {
          const errorData = axiosError.response.data || {};
          const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${axiosError.response.status}`;
          const error = new Error(errorMessage);
          error.status = axiosError.response.status;
          error.details = errorData.details;
          throw error;
        } else if (axiosError.request || xhrError.message.includes('Network')) {
          throw new Error(
            `Network error: Cannot reach ${url}\n\n` +
            `Please check:\n` +
            `1. Internet connection\n` +
            `2. If ${this.baseUrl} is accessible\n` +
            `3. API server status\n\n` +
            `Current config: ${USE_LOCAL_SERVER ? 'LOCAL SERVER' : 'VERCEL PRODUCTION'}`
          );
        } else if (axiosError.code === 'ECONNABORTED') {
          throw new Error(`Request timeout: ${url}. The request took too long (90s).`);
        }
        
        throw xhrError; // Throw the original XMLHttpRequest error
      }
    }
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
    // Also support react-native-image-crop-picker format (uses path)
    // react-native-image-crop-picker returns path directly (e.g., "/storage/emulated/0/...")
    // react-native-image-picker returns uri (e.g., "file:///storage/...")
    let fileUri = file.uri || file.path;
    if (!fileUri) {
      throw new Error('File URI or path is required');
    }

    console.log('📄 Original file object:', {
      hasUri: !!file.uri,
      hasPath: !!file.path,
      uri: file.uri?.substring(0, 50),
      path: file.path?.substring(0, 50),
      type: file.type,
      mime: file.mime,
      name: file.name,
      filename: file.filename,
      keys: Object.keys(file),
    });

    // Normalize URI - react-native-image-crop-picker uses absolute paths
    // If it's already a file:// or content:// URI, use it as is
    // If it's a path from react-native-image-crop-picker, ensure it has file:// prefix
    let normalizedUri = fileUri;
    if (!normalizedUri.startsWith('file://') && !normalizedUri.startsWith('content://') && !normalizedUri.startsWith('http://') && !normalizedUri.startsWith('https://')) {
      // react-native-image-crop-picker returns absolute paths like "/storage/emulated/0/..."
      // We need to add file:// prefix
      if (normalizedUri.startsWith('/')) {
        normalizedUri = 'file://' + normalizedUri;
      } else {
        normalizedUri = 'file:///' + normalizedUri;
      }
    }
    
    console.log('📄 Normalized URI:', {
      original: fileUri.substring(0, 50),
      normalized: normalizedUri.substring(0, 50),
      scheme: normalizedUri.split(':')[0],
    });

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
    // Support both react-native-image-picker (type) and react-native-image-crop-picker (mime)
    let fileType = file.type || file.mime;
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
    // For react-native-image-crop-picker: use path directly (absolute path like "/storage/emulated/0/...")
    // For react-native-image-picker: use normalizedUri with file:// prefix
    // React Native FormData accepts both absolute paths and file:// URIs
    let fileUriForFormData;
    if (file.path) {
      // react-native-image-crop-picker - use path directly (no file:// prefix needed)
      fileUriForFormData = file.path;
      console.log('📦 Using react-native-image-crop-picker path directly');
    } else {
      // react-native-image-picker - use normalized URI with file:// prefix
      fileUriForFormData = normalizedUri;
      console.log('📦 Using react-native-image-picker normalized URI');
    }
    
    console.log('📦 File for FormData:', {
      hasPath: !!file.path,
      hasUri: !!file.uri,
      usingPath: !!file.path,
      fileUriForFormData: fileUriForFormData?.substring(0, 50),
      type: fileType,
      name: fileName,
    });
    
    formData.append('file', {
      uri: fileUriForFormData,
      type: fileType,
      name: fileName,
    });
    
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
    
    console.log(`📤 Uploading file (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, { 
      fileName, 
      fileType, 
      bucket, 
      folder,
      url,
      baseUrl: this.baseUrl,
      usingLocalServer: USE_LOCAL_SERVER,
    });

    // Log FormData structure in detail (for debugging)
    if (formData._parts) {
      console.log('📦 FormData._parts structure:', formData._parts.map((part, index) => ({
        index,
        key: part[0],
        valueType: typeof part[1],
        valueIsObject: typeof part[1] === 'object',
        valueKeys: typeof part[1] === 'object' ? Object.keys(part[1] || {}) : [],
        valuePreview: typeof part[1] === 'string' 
          ? part[1].substring(0, 50) 
          : typeof part[1] === 'object' && part[1]?.uri
          ? `{uri: ${part[1].uri.substring(0, 30)}..., type: ${part[1].type}, name: ${part[1].name}}`
          : String(part[1]).substring(0, 50),
      })));
    }

    try {
      // Use XMLHttpRequest for file uploads (more reliable in React Native)
      // React Native's XMLHttpRequest handles FormData with file URIs better than axios
      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.open('POST', url);
        xhr.setRequestHeader('Accept', '*/*');
        // Do NOT set Content-Type - React Native FormData sets it automatically with boundary
        
        xhr.onload = () => {
          const responseText = xhr.responseText;
          
          console.log(`✅ XMLHttpRequest completed (attempt ${retryCount + 1}):`, {
            status: xhr.status,
            statusText: xhr.statusText,
            responseLength: responseText?.length,
          });
          
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(responseText);
              
              // Check for error in response body
              if (data.error) {
                reject(new Error(data.error));
                return;
              }

              // Extract URL - API should always return { success: true, url: string }
              const uploadUrl = data.url || data.publicUrl || data.signedUrl;
              
              if (!uploadUrl || typeof uploadUrl !== 'string') {
                console.error('❌ No URL in response:', JSON.stringify(data, null, 2));
                reject(new Error('Upload succeeded but no URL returned. Please try again.'));
                return;
              }

              console.log('✅ Upload successful, URL:', uploadUrl.substring(0, 50) + '...');

              // Return consistent structure
              resolve({
                success: true,
                url: uploadUrl,
                path: data.path || null,
                publicUrl: data.publicUrl || uploadUrl,
                signedUrl: data.signedUrl || null,
              });
            } catch (parseError) {
              reject(new Error('Invalid JSON response from server'));
            }
          } else {
            let errorData;
            try {
              errorData = JSON.parse(responseText);
            } catch (parseError) {
              errorData = { error: responseText || 'Request failed' };
            }
            
            const errorMsg = errorData.error || errorData.message || `Upload failed with status ${xhr.status}`;
            
            // Retry on 5xx errors (server errors) if we have retries left
            if (xhr.status >= 500 && retryCount < MAX_RETRIES) {
              console.log(`🔄 Server error ${xhr.status}, will retry... (${retryCount + 1}/${MAX_RETRIES})`);
              // Don't reject here, let the retry logic handle it
              const retryError = new Error(errorMsg);
              retryError.status = xhr.status;
              retryError.retryable = true;
              reject(retryError);
              return;
            }
            
            const error = new Error(errorMsg);
            error.status = xhr.status;
            reject(error);
          }
        };
        
        xhr.onerror = (error) => {
          console.error('❌ XMLHttpRequest onerror:', {
            readyState: xhr.readyState,
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText?.substring(0, 200),
            error: error,
          });
          
          const networkError = new Error('Network request failed - XMLHttpRequest error');
          networkError.retryable = true;
          reject(networkError);
        };
        
        xhr.ontimeout = () => {
          console.error('❌ XMLHttpRequest timeout after 90s');
          const timeoutError = new Error('Request timeout');
          timeoutError.retryable = true;
          reject(timeoutError);
        };
        
        xhr.timeout = 90000; // 90 seconds
        
        console.log('📡 Sending XMLHttpRequest POST request to:', url);
        xhr.send(formData);
      });
      
      return result;
    } catch (error) {
      console.error(`❌ Upload error (attempt ${retryCount + 1}):`, error);
      
      // Retry logic for retryable errors
      const isRetryable = error.retryable || 
                         error.message?.includes('Network request failed') || 
                         error.message?.includes('timeout') ||
                         error.message?.includes('Cannot reach') ||
                         (error.status && error.status >= 500);
      
      if (isRetryable && retryCount < MAX_RETRIES) {
        console.log(`🔄 Retryable error detected, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.uploadFile(file, bucket, folder, authorId, retryCount + 1);
      }
      
      // If XMLHttpRequest fails, try axios as fallback
      if (error.message?.includes('XMLHttpRequest') || error.message?.includes('Network request failed')) {
        console.warn('⚠️ XMLHttpRequest failed, trying axios fallback...');
        try {
          const response = await axios.post(url, formData, {
            headers: {
              'Accept': '*/*',
              // Do NOT set Content-Type - axios will automatically set it with boundary for FormData
            },
            timeout: 90000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          });
          
          const result = response.data;
          
          if (result.error) {
            throw new Error(result.error);
          }

          const uploadUrl = result.url || result.publicUrl || result.signedUrl;
          
          if (!uploadUrl || typeof uploadUrl !== 'string') {
            throw new Error('Upload succeeded but no URL returned. Please try again.');
          }

          console.log('✅ Axios fallback successful, URL:', uploadUrl.substring(0, 50) + '...');

          return {
            success: true,
            url: uploadUrl,
            path: result.path || null,
            publicUrl: result.publicUrl || uploadUrl,
            signedUrl: result.signedUrl || null,
          };
        } catch (axiosError) {
          console.error('❌ Axios fallback also failed:', axiosError);
          // Continue to throw the original error
        }
      }
      
      // Provide user-friendly error messages
      if (error.message && (error.message.includes('Network request failed') || error.message.includes('Cannot reach'))) {
        const diagnosticMsg = `Network error: Cannot reach ${this.baseUrl}/api/upload\n\n` +
          `Current configuration: ${USE_LOCAL_SERVER ? 'LOCAL SERVER' : 'VERCEL PRODUCTION'}\n\n` +
          `Troubleshooting:\n` +
          `1. Check internet connection\n` +
          `2. Check if ${this.baseUrl} is accessible\n` +
          (USE_LOCAL_SERVER 
            ? `3. For local server:\n` +
              `   - Android Emulator: Use http://10.0.2.2:3000\n` +
              `   - Physical Device: Use http://YOUR_IP:3000\n` +
              `   - Make sure admin server is running: cd admin && npm run dev\n`
            : `3. For Vercel: Verify https://admin-orcin-omega.vercel.app is accessible\n`)
        throw new Error(diagnosticMsg);
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
