# Yellow Tea Frontend Documentation

Welcome to the Yellow Tea Frontend documentation! This directory contains comprehensive guides and references for working with the authentication system and other frontend features.

## 📚 Documentation Index

### 🔐 Authentication & Security
- **[Authentication Middleware Documentation](./AUTHENTICATION_MIDDLEWARE.md)** - Complete guide to the authentication system
- **[Authentication Quick Reference](./AUTH_QUICK_REFERENCE.md)** - Quick start guide and common patterns

## 🚀 Getting Started

### For New Developers
1. Start with the [Authentication Quick Reference](./AUTH_QUICK_REFERENCE.md) for immediate implementation
2. Read the [Authentication Middleware Documentation](./AUTHENTICATION_MIDDLEWARE.md) for deep understanding
3. Check the codebase examples in `src/components/ProtectedRoute.tsx` and `src/utils/auth.ts`

### For Frontend Developers
- Understand the authentication flow and token management
- Learn how to protect routes and components
- Master error handling and user experience patterns

### For Backend Integration
- Review the API endpoints and request/response formats
- Understand token validation and security requirements
- Check CORS and cookie configuration

## 🛠️ Key Components

### Authentication System
- **AuthContext** (`src/contexts/AuthContext.tsx`) - Global authentication state
- **ProtectedRoute** (`src/components/ProtectedRoute.tsx`) - Route protection component
- **Auth Utils** (`src/utils/auth.ts`) - Token management and utilities
- **Auth Service** (`src/services/auth.ts`) - API integration functions

### Security Features
- JWT token-based authentication
- Dual token storage (localStorage + cookies)
- Automatic token inclusion in requests
- Route protection with redirect handling
- Comprehensive error handling

## 🔧 Implementation Examples

### Protecting a New Route
```typescript
import { ProtectedRoute } from '@/components/ProtectedRoute';

<Route path="/my-protected-page" element={
  <ProtectedRoute>
    <MyProtectedComponent />
  </ProtectedRoute>
} />
```

### Adding Authentication to a Component
```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;
  
  return <div>Welcome, {user.name}!</div>;
};
```

### Making Authenticated API Calls
```typescript
import { userAPI } from '@/services/auth';

const token = localStorage.getItem('token');
const data = await userAPI.getDashboard(token);
```

## 🔒 Security Best Practices

1. **Always use `ProtectedRoute` for user-specific content**
2. **Include `credentials: 'include'` in fetch requests**
3. **Handle 401 errors by redirecting to login**
4. **Clear tokens on logout and authentication failures**
5. **Validate user input before sending to backend**
6. **Use HTTPS in production environments**
7. **Never expose tokens in URLs or console logs**

## 🐛 Troubleshooting

### Common Issues
- **Token not being sent**: Check localStorage and Authorization header
- **401 errors**: Token may be expired, redirect to login
- **CORS issues**: Ensure backend allows credentials
- **Route protection not working**: Verify `ProtectedRoute` wrapper

### Debug Tools
```typescript
import { authDebug } from '@/utils/auth';

// Log authentication state
authDebug.logState();

// Test token validity
const isValid = await authDebug.testToken();
```

## 📱 Mobile Considerations

The authentication system is designed to work seamlessly across devices:
- Responsive loading states
- Touch-friendly error messages
- Optimized redirect flows
- Mobile-specific UX patterns

## 🧪 Testing

### Mock Authentication for Tests
```typescript
import { TestAuthProvider } from '@/components/ProtectedRoute';

render(
  <TestAuthProvider>
    <YourComponent />
  </TestAuthProvider>
);
```

### Testing Protected Routes
```typescript
describe('ProtectedRoute', () => {
  it('redirects unauthenticated users', () => {
    // Test implementation
  });
});
```

## 📚 Additional Resources

- [JWT.io](https://jwt.io/) - JWT token documentation
- [React Router](https://reactrouter.com/) - Route protection patterns
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) - Fetch API guide
- [Axios Documentation](https://axios-http.com/) - HTTP client configuration

## 🤝 Contributing

When adding new authentication features:
1. Update the relevant documentation files
2. Add examples and code snippets
3. Include security considerations
4. Test thoroughly across devices
5. Follow the established patterns

## 📞 Support

For questions about the authentication system:
1. Check the documentation first
2. Review the codebase examples
3. Test with the debug utilities
4. Consult the troubleshooting guide

---

**Happy coding! 🚀** 