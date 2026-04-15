# Authentication Quick Reference Guide

## 🚀 Quick Start

### 1. Protect a Route
```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

<Route path="/protected" element={
  <ProtectedRoute>
    <YourComponent />
  </ProtectedRoute>
} />
```

### 2. Use Authentication in Components
```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, loading, login, logout } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;
  
  return <div>Welcome, {user.name}!</div>;
};
```

### 3. Make Authenticated API Calls
```typescript
import { userAPI } from '@/services/auth';

const token = localStorage.getItem('token');
const userData = await userAPI.getDashboard(token);
```

## 🔧 Common Patterns

### Login Form
```typescript
const LoginForm = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/profile');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
};
```

### Protected Component with HOC
```typescript
import { withAuth } from '@/components/ProtectedRoute';

const ProtectedComponent = () => <div>Protected Content</div>;
export default withAuth(ProtectedComponent);
```

### Optional Authentication
```typescript
import { useOptionalAuth } from '@/components/ProtectedRoute';

const MyComponent = () => {
  const { user, isAuthenticated, isGuest } = useOptionalAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <div>Welcome back, {user.name}!</div>
      ) : (
        <div>Welcome, guest!</div>
      )}
    </div>
  );
};
```

## 🛠️ Utility Functions

### Token Management
```typescript
import { tokenUtils } from '@/utils/auth';

// Store token
tokenUtils.store(token);

// Get token
const token = tokenUtils.get();

// Clear token
tokenUtils.clear();

// Check if token exists
if (tokenUtils.exists()) {
  // Token is available
}
```

### Error Handling
```typescript
import { authErrorHandler } from '@/utils/auth';

try {
  await apiCall();
} catch (error) {
  const message = authErrorHandler.getMessage(error);
  toast({ title: "Error", description: message });
}
```

### Validation
```typescript
import { authValidation } from '@/utils/auth';

// Email validation
if (!authValidation.isValidEmail(email)) {
  setError('Invalid email address');
}

// Password validation
const passwordCheck = authValidation.isValidPassword(password);
if (!passwordCheck.isValid) {
  setErrors(passwordCheck.errors);
}
```

## 📱 Route Protection Options

### 1. Component-Level Protection
```typescript
<ProtectedRoute redirectTo="/login">
  <YourComponent />
</ProtectedRoute>
```

### 2. Hook-Based Protection
```typescript
import { useRequireAuth } from '@/components/ProtectedRoute';

const MyComponent = () => {
  const { user, loading } = useRequireAuth('/login');
  // Component will redirect if not authenticated
};
```

### 3. Inline Protection
```typescript
const MyComponent = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
};
```

## 🔒 Security Checklist

- ✅ Use `ProtectedRoute` for user-specific pages
- ✅ Include `credentials: 'include'` in fetch requests
- ✅ Handle 401 errors by redirecting to login
- ✅ Clear tokens on logout
- ✅ Validate user input
- ✅ Use HTTPS in production
- ✅ Don't expose tokens in URLs or logs

## 🐛 Debugging

### Check Authentication State
```typescript
import { authDebug } from '@/utils/auth';

// Log current auth state
authDebug.logState();

// Test token validity
const isValid = await authDebug.testToken();
```

### Common Issues
1. **Token not found**: Check localStorage and cookies
2. **401 errors**: Token may be expired
3. **CORS issues**: Ensure backend allows credentials
4. **Route not protected**: Verify `ProtectedRoute` wrapper

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/auth/logout` - Logout

### User Management
- `PATCH /api/v1/users/profile` - Update profile
- `PUT /api/v1/users/address` - Add address
- `GET /api/v1/users/orders` - Get orders
- `GET /api/v1/users/wishlist` - Get wishlist

## 🎯 Best Practices

1. **Always handle loading states**
2. **Provide user-friendly error messages**
3. **Use consistent token management**
4. **Implement proper logout flow**
5. **Test authentication flows thoroughly**
6. **Keep tokens secure and never expose them**

---

**Need more details?** See the full [Authentication Middleware Documentation](./AUTHENTICATION_MIDDLEWARE.md) 