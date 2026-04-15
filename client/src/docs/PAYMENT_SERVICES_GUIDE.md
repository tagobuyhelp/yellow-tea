# Payment & Order Services Implementation Guide

## Overview

This guide covers the implementation of payment and order services for the Yellow Tea eCommerce platform, including Razorpay integration, order management, and checkout flow.

## Services Structure

### 1. Payment Service (`src/services/payments.ts`)

The payment service handles all payment-related operations including:
- Payment method management
- Razorpay integration
- Order creation
- Payment verification
- COD order processing

#### Key Features:
- **Payment Methods API**: Fetch available payment methods from backend
- **Razorpay Integration**: Complete online payment flow
- **COD Processing**: Cash on Delivery order handling
- **Payment Verification**: Secure payment signature verification

#### Usage Example:
```typescript
import { checkoutService } from '@/services/payments';

// Get payment methods
const methods = await checkoutService.getPaymentMethods();

// Process online payment
const paymentResult = await checkoutService.processOnlinePayment(
  orderId,
  amount,
  customerInfo
);

// Process COD order
const codOrder = await checkoutService.processCODOrder(orderData);
```

### 2. Orders Service (`src/services/orders.ts`)

The orders service manages order lifecycle including:
- Order tracking
- Order history
- Refund management
- Invoice generation
- Order analytics

#### Key Features:
- **Order Management**: Complete CRUD operations for orders
- **Order Tracking**: Real-time order status tracking
- **Refund Processing**: Refund request and status management
- **Invoice Generation**: PDF invoice download
- **Order Analytics**: User order statistics

#### Usage Example:
```typescript
import { orderService } from '@/services/orders';

// Get user orders
const orders = await orderService.getUserOrders(1, 10, { status: 'delivered' });

// Track order
const tracking = await orderService.trackOrder(orderId);

// Download invoice
await orderService.downloadInvoice(orderId);
```

### 3. Payment Methods Hook (`src/hooks/use-payment-methods.ts`)

A custom React hook for managing payment methods state and API calls.

#### Features:
- Automatic payment methods fetching
- Loading and error state management
- Fallback to default payment methods
- Helper methods for payment method lookup

#### Usage Example:
```typescript
import { usePaymentMethods } from '@/hooks/use-payment-methods';

const MyComponent = () => {
  const { paymentMethods, loading, getPaymentMethodById } = usePaymentMethods();
  
  const selectedMethod = getPaymentMethodById('razorpay');
  
  return (
    <div>
      {loading ? 'Loading...' : (
        paymentMethods.map(method => (
          <div key={method.id}>{method.name}</div>
        ))
      )}
    </div>
  );
};
```

## API Integration

### Backend API Endpoints

The services are designed to work with the following backend endpoints:

#### Payment Endpoints:
- `GET /api/v1/payments/methods` - Get available payment methods
- `POST /api/v1/orders` - Create new order
- `POST /api/v1/payments/create-order` - Create Razorpay order
- `POST /api/v1/payments/verify` - Verify payment signature
- `GET /api/v1/payments/status/:orderId` - Get payment status

#### Order Endpoints:
- `GET /api/v1/orders/my-orders` - Get user orders
- `GET /api/v1/orders/:id` - Get order details
- `GET /api/v1/orders/:id/track` - Track order
- `PUT /api/v1/orders/:id/cancel` - Cancel order
- `POST /api/v1/orders/:id/refund-request` - Request refund
- `GET /api/v1/orders/:id/invoice` - Generate invoice

### Request/Response Formats

#### Create Order Request:
```typescript
interface CreateOrderPayload {
  orderItems: Array<{
    product: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}
```

#### Order Response:
```typescript
interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult: any;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt: string | null;
  isDelivered: boolean;
  deliveredAt: string | null;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  createdAt: string;
  updatedAt: string;
}
```

## Checkout Flow Implementation

### Updated Checkout Component

The `Checkout.tsx` component has been updated to use the new services:

#### Key Changes:
1. **Payment Methods Integration**: Uses `usePaymentMethods` hook
2. **Dynamic Payment Processing**: Handles both online and COD payments
3. **Improved Error Handling**: Better error messages and fallbacks
4. **API Alignment**: Matches backend API structure

#### Payment Flow:
1. **Step 1**: Customer information collection
2. **Step 2**: Shipping address and delivery options
3. **Step 3**: Payment method selection
4. **Step 4**: Order review and placement

#### Payment Processing:
```typescript
// For COD orders
if (orderDetails.paymentMethod === 'cod') {
  response = await checkoutService.processCODOrder(orderData);
} else {
  // For online payments
  const order = await checkoutService.createOrder(orderData);
  const paymentResult = await checkoutService.processOnlinePayment(
    order._id,
    order.totalPrice,
    customerInfo
  );
  response = paymentResult.data.order;
}
```

## Razorpay Integration

### Configuration

The Razorpay integration requires environment variables:

```env
# Development
REACT_APP_RAZORPAY_TEST_KEY=rzp_test_YOUR_KEY_ID

# Production
REACT_APP_RAZORPAY_LIVE_KEY=rzp_live_YOUR_KEY_ID
```

### Payment Flow

1. **Create Order**: Backend creates order and returns order ID
2. **Create Razorpay Order**: Frontend requests Razorpay order creation
3. **Initialize Payment**: Razorpay checkout modal opens
4. **Payment Processing**: User completes payment
5. **Verification**: Backend verifies payment signature
6. **Order Update**: Order status updated to paid

### Error Handling

The services include comprehensive error handling:

```typescript
try {
  const result = await checkoutService.processOnlinePayment(orderId, amount, customerInfo);
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Handle unauthorized
  } else if (error.response?.status === 400) {
    // Handle bad request
  } else {
    // Handle other errors
  }
}
```

## Order Management Features

### Order Tracking

Real-time order tracking with status updates:

```typescript
const tracking = await orderService.trackOrder(orderId);
// Returns: tracking number, courier info, status history
```

### Refund Management

Complete refund workflow:

```typescript
// Request refund
await orderService.requestRefund(orderId, amount, reason);

// Check refund status
const refundStatus = await orderService.getRefundStatus(orderId);
```

### Invoice Generation

PDF invoice download:

```typescript
await orderService.downloadInvoice(orderId);
```

## Testing

### Test Scenarios

1. **Successful Online Payment**:
   - Use Razorpay test card: 4111 1111 1111 1111
   - Any future expiry date
   - Any 3-digit CVV

2. **Failed Payment**:
   - Use invalid card details
   - Test error handling

3. **COD Order**:
   - Select COD payment method
   - Verify order creation without payment

4. **Order Tracking**:
   - Create order and track status
   - Test status updates

### Environment Setup

For testing, ensure:
- Backend API is running on `http://localhost:5000`
- Razorpay test keys are configured
- JWT authentication is working

## Security Considerations

1. **Payment Verification**: All payments are verified server-side
2. **Token Management**: JWT tokens are automatically included in requests
3. **Error Handling**: Sensitive information is not exposed in error messages
4. **HTTPS**: Production should use HTTPS for all API calls

## Performance Optimization

1. **Caching**: Payment methods are cached after first fetch
2. **Lazy Loading**: Razorpay script loads only when needed
3. **Error Boundaries**: React error boundaries for component-level error handling
4. **Loading States**: Proper loading indicators for better UX

## Troubleshooting

### Common Issues

1. **Payment Methods Not Loading**:
   - Check backend API connectivity
   - Verify CORS configuration
   - Check network tab for errors

2. **Razorpay Not Loading**:
   - Verify script loading
   - Check Razorpay key configuration
   - Ensure HTTPS in production

3. **Order Creation Fails**:
   - Validate order data structure
   - Check authentication token
   - Verify backend API response

### Debug Mode

Enable debug logging:

```typescript
// In development
console.log('Order data:', orderData);
console.log('Payment result:', paymentResult);
```

## Future Enhancements

1. **Multiple Payment Gateways**: Support for additional payment providers
2. **Subscription Payments**: Recurring payment support
3. **Advanced Analytics**: Detailed order and payment analytics
4. **Mobile Optimization**: Enhanced mobile payment experience
5. **International Payments**: Multi-currency support

## Support

For technical support:
- Check API documentation
- Review error logs
- Test with sample data
- Contact backend team for API issues 