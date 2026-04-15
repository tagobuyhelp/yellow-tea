# Authentication Middleware Documentation for Frontend Developers

## 🎯 Overview

This documentation explains how to work with the authentication system in your Yellow Tea Frontend. The frontend uses JWT tokens for authentication and provides middleware patterns for protecting routes and managing user sessions.

## 🔐 How Authentication Works

### Token Sources
The frontend accepts JWT tokens from two sources:
- **Authorization Header** (Recommended): `Bearer <token>`
- **HTTP-Only Cookie**: Automatically sent with requests
- **LocalStorage**: For client-side access and persistence

### Token Lifecycle
1. **Login/Register** → Backend returns JWT token
2. **Store token** → Frontend stores in localStorage and cookies
3. **Send with requests** → Include in Authorization header
4. **Token expires** → User needs to login again

## 📡 Making Authenticated Requests

### Method 1: Authorization Header (Recommended)

```typescript
// Using fetch with Authorization header
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    credentials: 'include', // Include cookies
  });
  
  return response.json();
};
```

### Method 2: Using Auth Service Functions

```typescript
// Using the auth service functions
import { userAPI } from '@/services/auth';

const token = localStorage.getItem('token');
if (token) {
  const userData = await userAPI.getDashboard(token);
  const orders = await userAPI.getOrders(token);
  const wishlist = await userAPI.getWishlist(token);
}
```

### Method 3: Using Axios Interceptors

```typescript
// Axios automatically adds token via interceptors
import { apiClient } from '@/services/api';

const response = await apiClient.get('/users/dashboard');
// Token is automatically added to Authorization header
```

## 🛡️ Route Protection Patterns

### Pattern 1: Component-Level Protection

```typescript
// ProtectedRoute component
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
```

### Pattern 2: Hook-Based Protection

```typescript
// Custom hook for route protection
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useRequireAuth = (redirectTo = '/login') => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, navigate, redirectTo]);

  return { user, loading };
};
```

### Pattern 3: Inline Protection

```typescript
// Direct protection in component
const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div>
      {/* Protected content */}
    </div>
  );
};
```

## 🚫 Handling Authentication Errors

### Common Error Responses

```typescript
// Error handling patterns
const handleAuthError = (error: any) => {
  switch (error.response?.status) {
    case 401:
      // Unauthorized - token expired or invalid
      localStorage.removeItem('token');
      Cookies.remove('jwt');
      window.location.href = '/login';
      break;
      
    case 403:
      // Forbidden - insufficient permissions
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this resource.",
        variant: "destructive",
      });
      break;
      
    case 422:
      // Validation error
      const errors = error.response.data.errors;
      Object.keys(errors).forEach(field => {
        toast({
          title: "Validation Error",
          description: errors[field].message,
          variant: "destructive",
        });
      });
      break;
      
    default:
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
  }
};
```

### Token Refresh Pattern

```typescript
// Automatic token refresh
const refreshToken = async () => {
  try {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      return data.token;
    }
  } catch (error) {
    // Refresh failed, redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};
```

## 🔧 Authentication Context Usage

### Basic Usage

```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login('email', 'password')}>Login</button>
      )}
    </div>
  );
};
```

### Advanced Usage with Error Handling

```typescript
const LoginForm = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await login(email, password);
      // Redirect on success
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

## 🔄 Token Management

### Storing Tokens

```typescript
// Store token in multiple places for redundancy
const storeToken = (token: string) => {
  // LocalStorage for client-side access
  localStorage.setItem('token', token);
  
  // Cookie for automatic requests
  Cookies.set('jwt', token, { 
    expires: 7, 
    secure: window.location.protocol === 'https:',
    sameSite: 'strict'
  });
};
```

### Retrieving Tokens

```typescript
// Get token with fallback
const getToken = (): string | null => {
  return localStorage.getItem('token') || Cookies.get('jwt') || null;
};
```

### Clearing Tokens

```typescript
// Clear all token storage
const clearTokens = () => {
  localStorage.removeItem('token');
  Cookies.remove('jwt');
};
```

## 🛠️ API Service Patterns

### Authenticated API Client

```typescript
// Create authenticated API client
const createAuthClient = () => {
  const client = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearTokens();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};
```

### User API Functions

```typescript
// User-related API functions
export const userAPI = {
  // Profile management
  updateProfile: async (profileData: ProfileUpdate) => {
    const token = getToken();
    if (!token) throw new Error('No token available');
    
    const response = await fetch('/api/v1/users/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    
    return response.json();
  },

  // Address management
  addAddress: async (address: AddressData) => {
    const token = getToken();
    if (!token) throw new Error('No token available');
    
    const response = await fetch('/api/v1/users/address', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(address),
    });
    
    return response.json();
  },

  // Order management
  getOrders: async () => {
    const token = getToken();
    if (!token) throw new Error('No token available');
    
    const response = await fetch('/api/v1/users/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.json();
  },
};
```

## 🔒 Security Best Practices

### 1. Token Storage
- ✅ Store tokens in localStorage for client-side access
- ✅ Use HTTP-only cookies for automatic requests
- ✅ Implement token expiration handling
- ❌ Never store sensitive data in localStorage
- ❌ Don't expose tokens in URLs

### 2. Request Security
- ✅ Always use HTTPS in production
- ✅ Include `credentials: 'include'` for cookie-based auth
- ✅ Validate tokens before making requests
- ❌ Don't send tokens over unsecured connections

### 3. Error Handling
- ✅ Handle 401 errors by redirecting to login
- ✅ Clear tokens on authentication failures
- ✅ Show user-friendly error messages
- ❌ Don't expose sensitive error details

### 4. Route Protection
- ✅ Protect all user-specific routes
- ✅ Implement loading states during auth checks
- ✅ Redirect unauthenticated users
- ❌ Don't rely solely on client-side protection

## 📱 Mobile Considerations

### Responsive Authentication

```typescript
// Mobile-friendly auth patterns
const useMobileAuth = () => {
  const { user, loading } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await login(credentials.email, credentials.password);
      
      // On mobile, redirect to profile after login
      if (isMobile) {
        navigate('/profile');
      }
    } catch (error) {
      // Mobile-specific error handling
      if (isMobile) {
        // Show toast instead of modal
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  return { handleLogin, isMobile };
};
```

## 🧪 Testing Authentication

### Mock Authentication for Testing

```typescript
// Test utilities for authentication
export const mockAuthContext = {
  user: {
    _id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
  },
  loading: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
};

// Test wrapper
export const TestAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Testing Protected Routes

```typescript
// Test protected routes
describe('ProtectedRoute', () => {
  it('redirects unauthenticated users', () => {
    render(
      <TestAuthProvider>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestAuthProvider>
    );
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
```

## 🔍 Debugging Authentication Issues

### Common Issues and Solutions

1. **Token not being sent**
   - Check localStorage for token
   - Verify Authorization header format
   - Ensure `credentials: 'include'` is set

2. **401 errors on valid requests**
   - Token may be expired
   - Check token format and validity
   - Verify backend token validation

3. **CORS issues**
   - Ensure backend allows credentials
   - Check origin configuration
   - Verify cookie settings

4. **Route protection not working**
   - Check AuthContext provider setup
   - Verify loading state handling
   - Ensure proper redirect logic

### Debug Utilities

```typescript
// Debug authentication state
const debugAuth = () => {
  const token = localStorage.getItem('token');
  const cookieToken = Cookies.get('jwt');
  
  console.log('Auth Debug Info:', {
    hasLocalStorageToken: !!token,
    hasCookieToken: !!cookieToken,
    tokenLength: token?.length,
    tokenPreview: token?.substring(0, 20) + '...',
  });
};

// Use in development
if (process.env.NODE_ENV === 'development') {
  debugAuth();
}
```

## 📚 Additional Resources

- [JWT.io](https://jwt.io/) - JWT token decoder and documentation
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) - Fetch API documentation
- [React Router Documentation](https://reactrouter.com/) - Route protection patterns
- [Axios Documentation](https://axios-http.com/) - HTTP client configuration

---

**Note**: This documentation is specific to the Yellow Tea Frontend implementation. Always refer to your backend API documentation for endpoint-specific details and requirements. 