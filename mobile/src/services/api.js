/**
 * API Client for Mobile App
 * Handles all API requests to Next.js API routes
 */

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
    
    console.log('API Request:', { url, method: options.method || 'GET', baseUrl: this.baseUrl });
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        ...options.headers,
      },
      ...options,
    };

    let timeoutId;
    try {
      // Add timeout for all requests
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      config.signal = controller.signal;
      
      const response = await fetch(url, config);
      if (timeoutId) clearTimeout(timeoutId);
      
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
      if (timeoutId) clearTimeout(timeoutId);
      console.error(`API Error (${endpoint}):`, error);
      console.error(`API Error details:`, {
        url,
        method: options.method || 'GET',
        baseUrl: this.baseUrl,
        errorName: error.name,
        errorMessage: error.message,
        usingLocalServer: USE_LOCAL_SERVER,
      });
      
      // Re-throw with more context if it's a network error
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout: ${url}. Please check your internet connection.`);
      }
      
      if (error.message === 'Network request failed' || error.name === 'TypeError') {
        const networkError = new Error(
          `Network error: Cannot reach ${url}\n\n` +
          `Please check:\n` +
          `1. Internet connection\n` +
          `2. If ${this.baseUrl} is accessible\n` +
          `3. API server status`
        );
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

  // Create book with FormData (files + metadata) or JSON (metadata only)
  async createBook(data, formData = null) {
    if (formData) {
      // Use FormData for single API call with files
      const url = `${this.baseUrl}/api/books`;
      console.log('📤 Creating book with FormData (single API call)...');
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
        
        // Use the same request pattern as other APIs, but override headers for FormData
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for large files
        
        const response = await fetch(url, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': '*/*',
            // Do NOT set Content-Type - React Native FormData sets it automatically with boundary
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        console.log('📥 Response received:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries()),
        });
        
        if (!response.ok) {
          let errorData;
          try {
            const responseText = await response.text();
            errorData = JSON.parse(responseText);
          } catch (parseError) {
            const responseText = await response.text();
            errorData = { error: responseText || 'Request failed' };
          }
          const error = new Error(errorData.error || `HTTP error! status: ${response.status}`);
          error.status = response.status;
          console.error('❌ Book creation failed:', error);
          throw error;
        }
        
        const responseText = await response.text();
        console.log('📥 Response text length:', responseText.length);
        console.log('📥 Response text preview:', responseText.substring(0, 200));
        
        const result = JSON.parse(responseText);
        console.log('✅ Book created successfully:', {
          bookId: result.book?.id,
          title: result.book?.title,
          hasCoverImage: !!result.book?.cover_image_url,
          hasPdf: !!result.book?.pdf_url,
        });
        return result;
      } catch (error) {
        console.error('❌ Error creating book with FormData:', error);
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
          status: error.status,
        });
        
        // Re-throw with more context if it's a network error
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout: ${url}. The request took too long (120s). Try with smaller files or check Vercel function timeout.`);
        }
        
        // Check if it's a network error or fetch error
        const isNetworkError = error.message === 'Network request failed' || 
                              error.name === 'TypeError' ||
                              error.message?.includes('fetch') ||
                              error.message?.includes('Network');
        
        if (isNetworkError) {
          // Try to get more details about the error
          const errorDetails = {
            name: error.name,
            message: error.message,
            stack: error.stack?.substring(0, 200),
          };
          
          console.error('🔴 Network Error Details:', errorDetails);
          
          const networkError = new Error(
            `Network error: Cannot reach the server at ${url}\n\n` +
            `Error: ${error.message}\n` +
            `Current configuration: ${this.baseUrl.includes('localhost') ? 'LOCAL' : 'VERCEL PRODUCTION'}\n\n` +
            `Troubleshooting:\n` +
            `1. Check internet connection\n` +
            `2. Check if ${this.baseUrl} is accessible\n` +
            `3. For Vercel: Check function logs at vercel.com/dashboard\n` +
            `4. Try uploading without files first to test connection\n` +
            `5. Request might be too large - try smaller files\n` +
            `6. Check Vercel function timeout (max 10s on Hobby plan)`
          );
          networkError.originalError = error;
          networkError.details = errorDetails;
          throw networkError;
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
  async updateProfile(formData) {
    const url = `${this.baseUrl}/api/profile/update`;
    
    console.log('📤 Updating profile:', {
      url,
      baseUrl: this.baseUrl,
      hasFormData: !!formData,
      usingLocalServer: USE_LOCAL_SERVER,
      isDev: __DEV__,
    });
    
    // First, test if the endpoint is reachable with a simple OPTIONS request
    try {
      console.log('🔍 Testing endpoint connectivity...');
      const testResponse = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Accept': '*/*',
        },
      });
      console.log('✅ Endpoint is reachable, OPTIONS status:', testResponse.status);
    } catch (testError) {
      console.warn('⚠️ Endpoint connectivity test failed:', testError.message);
      // Continue anyway - might be a CORS preflight issue
    }
    
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
          : String(part[1]).substring(0, 50),
      })));
    }
    
    try {
      // Use XMLHttpRequest for FormData (more reliable for file uploads)
      // Use POST instead of PUT for better React Native compatibility
      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.open('POST', url);
        xhr.setRequestHeader('Accept', '*/*');
        // Do NOT set Content-Type - let React Native FormData set it automatically
        
        xhr.onload = () => {
          const responseText = xhr.responseText;
          const responseHeaders = new Headers();
          
          // Parse response headers
          const allHeaders = xhr.getAllResponseHeaders();
          if (allHeaders) {
            allHeaders.split('\r\n').forEach(line => {
              const parts = line.split(': ');
              if (parts.length === 2) {
                responseHeaders.set(parts[0], parts[1]);
              }
            });
          }
          
          console.log('✅ XMLHttpRequest completed:', {
            status: xhr.status,
            statusText: xhr.statusText,
            responseLength: responseText?.length,
          });
          
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            statusText: xhr.statusText,
            headers: responseHeaders,
            text: async () => responseText,
            json: async () => {
              try {
                return JSON.parse(responseText);
              } catch (e) {
                throw new Error('Invalid JSON response');
              }
            },
          });
        };
        
        xhr.onerror = (error) => {
          console.error('❌ XMLHttpRequest onerror:', {
            readyState: xhr.readyState,
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText?.substring(0, 200),
            error: error,
            url: url,
            baseUrl: this.baseUrl,
          });
          reject(new Error('Network request failed - XMLHttpRequest error'));
        };
        
        xhr.ontimeout = () => {
          console.error('❌ XMLHttpRequest timeout after 90s');
          reject(new Error('Request timeout'));
        };
        
        xhr.timeout = 90000; // 90 seconds
        
        console.log('📡 Sending XMLHttpRequest POST request to:', url);
        // Send FormData
        xhr.send(formData);
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
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
      console.error('❌ Profile update error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        url: url,
        baseUrl: this.baseUrl,
        usingLocalServer: USE_LOCAL_SERVER,
        isDev: __DEV__,
        stack: error.stack,
      });
      
      // Fallback to fetch if XMLHttpRequest fails
      if (error.message && (error.message.includes('XMLHttpRequest') || error.message.includes('Network request failed'))) {
        console.warn('⚠️ XMLHttpRequest failed, trying fetch...');
        try {
          const fetchResponse = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': '*/*',
              // Do NOT set Content-Type - React Native FormData sets it automatically
            },
          });
          
          console.log('✅ Fetch request completed:', {
            status: fetchResponse.status,
            statusText: fetchResponse.statusText,
            ok: fetchResponse.ok,
          });
          
          if (!fetchResponse.ok) {
            let errorData;
            try {
              errorData = await fetchResponse.json();
            } catch (parseError) {
              const text = await fetchResponse.text();
              errorData = { error: text || 'Request failed' };
            }
            
            const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${fetchResponse.status}`;
            const fetchError = new Error(errorMessage);
            fetchError.status = fetchResponse.status;
            fetchError.details = errorData.details;
            throw fetchError;
          }
          
          return await fetchResponse.json();
        } catch (fetchError) {
          console.error('❌ Fetch also failed:', fetchError);
          console.error('Fetch error details:', {
            name: fetchError.name,
            message: fetchError.message,
            url: url,
            baseUrl: this.baseUrl,
            usingLocalServer: USE_LOCAL_SERVER,
            isDev: __DEV__,
          });
          
          // Provide more helpful error message
          if (fetchError.message && fetchError.message.includes('Network request failed')) {
            throw new Error(
              `Network error: Cannot reach ${url}\n\n` +
              `Please check:\n` +
              `1. Internet connection\n` +
              `2. If ${this.baseUrl} is accessible\n` +
              `3. API server status\n\n` +
              `Current config: ${USE_LOCAL_SERVER ? 'LOCAL SERVER' : 'VERCEL PRODUCTION'}`
            );
          }
          
          throw fetchError;
        }
      }
      
      throw error;
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

    try {
      // Test connection first (optional - helps with debugging)
      console.log('🔍 Testing connection to:', url);
      
      // Make the request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout for large files
      
      let response;
      try {
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
        
        console.log('📡 Sending fetch request...', {
          method: 'POST',
          url: url,
          hasBody: !!formData,
          timeout: '90s',
          formDataKeys: formData._parts ? formData._parts.map(p => p[0]) : 'unknown',
        });
        
        // Try XMLHttpRequest first (more reliable for file uploads in React Native)
        // Fallback to fetch if XMLHttpRequest is not available
        let useXHR = true;
        try {
          response = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            xhr.open('POST', url);
            xhr.setRequestHeader('Accept', '*/*');
            // Do NOT set Content-Type - let React Native FormData set it automatically
            
            xhr.onload = () => {
              // Create a Response-like object for compatibility
              const responseText = xhr.responseText;
              const responseHeaders = new Headers();
              
              // Parse response headers
              const allHeaders = xhr.getAllResponseHeaders();
              if (allHeaders) {
                allHeaders.split('\r\n').forEach(line => {
                  const parts = line.split(': ');
                  if (parts.length === 2) {
                    responseHeaders.set(parts[0], parts[1]);
                  }
                });
              }
              
              resolve({
                ok: xhr.status >= 200 && xhr.status < 300,
                status: xhr.status,
                statusText: xhr.statusText,
                headers: responseHeaders,
                text: async () => responseText,
                json: async () => {
                  try {
                    return JSON.parse(responseText);
                  } catch (e) {
                    throw new Error('Invalid JSON response');
                  }
                },
              });
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
            
            // Send FormData
            xhr.send(formData);
          });
          
          console.log('✅ XMLHttpRequest completed, status:', response.status);
        } catch (xhrError) {
          console.warn('⚠️ XMLHttpRequest failed, trying fetch...', xhrError);
          useXHR = false;
          
          // Fallback to fetch
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
          console.log('✅ Fetch request completed, status:', response.status);
        }
        
        clearTimeout(timeoutId);
        
        console.log('✅ Fetch request completed, status:', response.status);
        
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
        console.error(`❌ Fetch error details:`, {
          name: fetchError.name,
          message: fetchError.message,
          url: url,
          apiBaseUrl: this.baseUrl,
          usingLocalServer: USE_LOCAL_SERVER,
          isDev: __DEV__,
          errorType: fetchError.constructor.name,
          stack: fetchError.stack,
          // Additional debugging info
          fileName: fileName,
          fileType: fileType,
          bucket: bucket,
          folder: folder,
        });
        
        // Handle different types of fetch errors
        if (fetchError.name === 'AbortError') {
          // Retry on timeout if we have retries left
          if (retryCount < MAX_RETRIES) {
            console.log(`⏳ Upload timeout, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
            return this.uploadFile(file, bucket, folder, authorId, retryCount + 1);
          }
          throw new Error(`Upload timeout: The request took too long. URL: ${url}`);
        }
        
        // Retry on network errors if we have retries left
        if (fetchError.message && (fetchError.message.includes('Network request failed') || fetchError.message.includes('Failed to fetch'))) {
          if (retryCount < MAX_RETRIES) {
            console.log(`🔄 Network error, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
            console.log(`🔗 Trying URL: ${url}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
            return this.uploadFile(file, bucket, folder, authorId, retryCount + 1);
          }
          // Provide detailed error message with troubleshooting steps
          const errorMsg = `Network error: Cannot reach the server at ${url}\n\n` +
            `This is likely an Android emulator networking issue.\n\n` +
            `Troubleshooting:\n` +
            `1. Check if the Android emulator has internet connectivity:\n` +
            `   - Open Chrome browser in the emulator\n` +
            `   - Try to visit https://admin-orcin-omega.vercel.app\n` +
            `   - If it doesn't load, the emulator has no internet\n\n` +
            `2. Restart the Android emulator with internet connectivity\n\n` +
            `3. Try testing on a physical Android device instead of emulator\n\n` +
            `4. Check your computer's internet connection\n\n` +
            `5. If Postman works but mobile app doesn't, it's likely an emulator networking issue\n\n` +
            `Note: Postman works fine, so the API is working correctly. This is a client-side networking issue.`;
          throw new Error(errorMsg);
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
