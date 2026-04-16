import Cookies from 'js-cookie';

// Token management utilities
export const tokenUtils = {
  // Store token in multiple places for redundancy
  store: (token: string, options?: { expires?: number; secure?: boolean }) => {
    const { expires = 7, secure = window.location.protocol === 'https:' } = options || {};
    
    // LocalStorage for client-side access
    localStorage.setItem('token', token);
    
    // Cookie for automatic requests
    Cookies.set('jwt', token, { 
      expires, 
      secure,
      sameSite: 'strict'
    });
  },

  // Get token with fallback
  get: (): string | null => {
    // Check both token keys for compatibility
    return localStorage.getItem('token') || localStorage.getItem('authToken') || Cookies.get('jwt') || null;
  },

  // Clear all token storage
  clear: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    Cookies.remove('jwt');
  },

  // Check if token exists
  exists: (): boolean => {
    return !!(localStorage.getItem('token') || localStorage.getItem('authToken') || Cookies.get('jwt'));
  },

  // Get token info (without exposing the full token)
  getInfo: () => {
    const token = tokenUtils.get();
    if (!token) return null;
    
    return {
      exists: true,
      length: token.length,
      preview: token.substring(0, 20) + '...',
      // You could decode the JWT payload here if needed
    };
  }
};

// Authentication validation utilities
export const authValidation = {
  // Check if email is valid
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Check if password meets requirements
  isValidPassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Check if passwords match
  doPasswordsMatch: (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
  }
};

// Error handling utilities
export const authErrorHandler = {
  // Handle common authentication errors
  handle: (error: { 
    response?: { status?: number; data?: { message?: string; errors?: unknown } }; 
    request?: unknown; 
    message?: string; 
  }, options?: { 
    onUnauthorized?: () => void;
    onForbidden?: () => void;
    onValidation?: (errors: unknown) => void;
    onNetwork?: () => void;
  }) => {
    const {
      onUnauthorized = () => {
        tokenUtils.clear();
        window.location.href = '/login';
      },
      onForbidden = () => {
        console.error('Access forbidden');
      },
      onValidation = (errors) => {
        console.error('Validation errors:', errors);
      },
      onNetwork = () => {
        console.error('Network error');
      }
    } = options || {};

    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          onUnauthorized();
          break;
        case 403:
          onForbidden();
          break;
        case 422:
          onValidation(error.response.data.errors);
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      // Network error
      onNetwork();
    } else {
      // Other error
      console.error('Error:', error.message);
    }
  },

  // Get user-friendly error message
  getMessage: (error: { response?: { status?: number; data?: { message?: string } }; message?: string }): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.response?.status === 401) {
      return 'Please log in to continue';
    }
    
    if (error.response?.status === 403) {
      return 'You don\'t have permission to access this resource';
    }
    
    if (error.response?.status === 422) {
      return 'Please check your input and try again';
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  }
};

// URL utilities for authentication
export const authUrlUtils = {
  // Get return URL from query params
  getReturnUrl: (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('returnTo');
  },

  // Set return URL in query params
  setReturnUrl: (url: string): string => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('returnTo', url);
    return currentUrl.toString();
  },

  // Remove return URL from query params
  removeReturnUrl: (): string => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('returnTo');
    return currentUrl.toString();
  },

  // Redirect to return URL or default
  redirectToReturnUrl: (defaultUrl: string = '/profile') => {
    const returnUrl = authUrlUtils.getReturnUrl();
    const redirectUrl = returnUrl || defaultUrl;
    
    // Clean up the URL
    window.location.href = authUrlUtils.removeReturnUrl();
    
    // Redirect after a short delay to ensure URL cleanup
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 100);
  }
};



// Export all utilities
export default {
  tokenUtils,
  authValidation,
  authErrorHandler,
  authUrlUtils,
}; 
