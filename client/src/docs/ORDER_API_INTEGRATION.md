# Order API Integration Guide for Frontend Developers

## Overview
This guide provides comprehensive information for integrating the Yellow Tea Order API into the frontend application.

## Base URLs
- **Development**: `http://localhost:5000/api/v1/orders`
- **Production**: `https://api.yellowtea.com/api/v1/orders`

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Available Endpoints

### 1. Create Order
**POST** `/orders`

Creates a new order with items, shipping address, and payment details.

**Request Body:**
```typescript
{
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    apartment?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  billingAddress: {
    street: string;
    apartment?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: Array<{
    productId: string | number;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  deliveryCharges: number;
  tax: number;
  total: number;
  deliveryOption: string;
  paymentMethod: string;
  specialInstructions?: string;
  newsletterSubscription?: boolean;
  currency: string;
  orderDate: string;
}
```

**Response (201):**
```typescript
{
  success: boolean;
  data: {
    _id: string;
    orderNumber: string;
    status: string;
    // ... other order details
  };
  message: string;
}
```

### 2. Track Order
**GET** `/orders/:id/track`

Get tracking information for an order.

**Response (200):**
```typescript
{
  success: boolean;
  data: {
    _id: string;
    orderNumber: string;
    status: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
    // ... other order details
  };
}
```

### 3. Cancel Order
**PUT** `/orders/:id/cancel`

Cancel an existing order.

**Request Body:**
```typescript
{
  reason: string;
}
```

**Response (200):**
```typescript
{
  success: boolean;
  data: {
    _id: string;
    status: "cancelled";
    cancelledAt: string;
    cancellationReason: string;
  };
  message: string;
}
```

### 4. Generate Invoice
**GET** `/orders/:id/invoice`

Get invoice data for a paid order.

**Response (200):**
```typescript
{
  success: boolean;
  data: {
    invoiceNumber: string;
    orderDetails: object;
    // ... invoice data
  };
}
```

### 5. Process Refund (Admin Only)
**PUT** `/orders/:id/refund`

Process refund for a cancelled order.

**Request Body:**
```typescript
{
  amount: number;
  reason: string;
}
```

### 6. Update Shipping Details (Admin Only)
**PUT** `/orders/:id/shipping`

Update shipping details for an order.

**Request Body:**
```typescript
{
  trackingNumber?: string;
  estimatedDelivery?: string;
  status?: string;
}
```

## Admin-Only Analytics Endpoints

### 7. Order Statistics
**GET** `/orders/stats`

Get comprehensive order statistics.

### 8. Order Analytics
**GET** `/orders/analytics?startDate=2025-07-01&endDate=2025-07-31`

Get detailed analytics for dashboard.

### 9. Export Orders
**GET** `/orders/export?startDate=2025-07-01&endDate=2025-07-31`

Export orders to CSV format.

### 10. Order Count by Status
**GET** `/orders/count-by-status`

Get count of orders grouped by status.

## Field Mapping Guide

The frontend automatically maps fields to match the backend API requirements:

| Frontend Field | Backend Field | Notes |
|----------------|---------------|-------|
| `items` | `orderItems` | Array of order items |
| `productId` | `product` | Use null for custom items |
| `pincode` | `pincode` | In shipping address |
| `paymentMethod: "card"` | `paymentMethod: "credit_card"` | Auto-mapped |
| `specialInstructions` | `notes` | Stored as notes |
| `deliveryCharges` | `shippingPrice` | Auto-mapped |
| `subtotal` | `itemsPrice` | Auto-mapped |

## Error Handling

### HTTP Status Codes
| Status | Description |
|--------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation errors |
| 401 | Unauthorized - Invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Order not found |
| 500 | Internal Server Error |

### Error Response Format
```typescript
{
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
```

## Usage Examples

### Creating an Order
```typescript
import { orderAPI } from '@/services/api';

const createOrder = async () => {
  try {
    const orderData = {
      customerName: "John Doe",
      customerEmail: "john@example.com",
      customerPhone: "+919876543210",
      shippingAddress: {
        street: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        country: "India"
      },
      billingAddress: {
        // ... same as shipping address
      },
      items: [
        {
          productId: "product123",
          name: "Assam Masala Tea",
          quantity: 2,
          price: 299,
          total: 598
        }
      ],
      subtotal: 598,
      deliveryCharges: 99,
      tax: 108,
      total: 805,
      deliveryOption: "standard",
      paymentMethod: "card",
      specialInstructions: "Please deliver in the morning",
      newsletterSubscription: true,
      currency: "INR",
      orderDate: new Date().toISOString()
    };

    const response = await orderAPI.createOrder(orderData);
    console.log('Order created:', response.data);
    
    // Navigate to success page
    navigate(`/order-success/${response.data._id}`);
  } catch (error) {
    console.error('Order creation failed:', error);
  }
};
```

### Tracking an Order
```typescript
const trackOrder = async (orderId: string) => {
  try {
    const response = await orderAPI.trackOrder(orderId);
    console.log('Order status:', response.data.status);
    return response.data;
  } catch (error) {
    console.error('Order tracking failed:', error);
    throw error;
  }
};
```

### Cancelling an Order
```typescript
const cancelOrder = async (orderId: string, reason: string) => {
  try {
    const response = await orderAPI.cancelOrder(orderId, reason);
    console.log('Order cancelled:', response.data);
    return response.data;
  } catch (error) {
    console.error('Order cancellation failed:', error);
    throw error;
  }
};
```

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Loading States**: Show loading indicators during API calls
3. **Validation**: Validate data before sending to API
4. **Token Management**: Ensure JWT token is available before making requests
5. **User Feedback**: Show appropriate success/error messages to users
6. **Retry Logic**: Implement retry logic for failed requests where appropriate

## Common Issues and Solutions

### 401 Unauthorized
- Check if JWT token is valid and not expired
- Ensure token is stored in localStorage
- Verify Authorization header format

### 400 Bad Request
- Validate all required fields are present
- Check field formats (email, phone, pincode)
- Ensure items array is not empty

### 404 Not Found
- Verify order ID exists
- Check if user has permission to access the order
- Ensure correct endpoint URL

### 403 Forbidden
- Check user permissions for admin-only endpoints
- Verify user role and access rights

## Testing

Use the provided API endpoints with tools like Postman or curl to test:

```bash
# Create order
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test User",...}'

# Track order
curl -X GET http://localhost:5000/api/v1/orders/ORDER_ID/track \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Support

For API-related issues or questions, refer to:
- Backend API documentation
- Error logs in browser console
- Network tab in browser dev tools
- Backend team for server-side issues 