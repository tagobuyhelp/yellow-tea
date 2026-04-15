import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Search,
  ArrowLeft,
  Download,
  Phone,
  Mail
} from 'lucide-react';
import { orderAPI } from '@/services/api';
import { userAPI } from '@/services/auth';
import { downloadInvoicePDF } from '@/utils/pdfGenerator';

// TypeScript interfaces for order tracking
interface TrackingEvent {
  status: string;
  timestamp: string;
  description: string;
  location?: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
  productId?: string;
  _id?: string;
}

// Extended interface for order items from API
interface ApiOrderItem extends OrderItem {
  image?: string;
}

interface ShippingAddress {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface OrderTrackingData {
  orderId: string;
  orderNumber?: string;
  status: string;
  orderDate: string;
  total: number;
  paymentMethod: string;
  customerName: string;
  shippingAddress: ShippingAddress;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  trackingHistory?: TrackingEvent[];
  estimatedDelivery?: string;
  trackingNumber?: string;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

interface TimelineEvent {
  status: string;
  date: string;
  description: string;
}

const TrackOrder = () => {
  const { orderId: urlOrderId } = useParams();
  const { toast } = useToast();
  const [orderId, setOrderId] = useState(urlOrderId || '');
  const [orderData, setOrderData] = useState<OrderTrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  // Function to fetch complete order details
  const fetchCompleteOrderDetails = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const ordersResponse = await userAPI.getOrders(token);
      if (ordersResponse.success && Array.isArray(ordersResponse.data)) {
        const completeOrder = ordersResponse.data.find(order => order._id === orderId);
        return completeOrder;
      }
      return null;
    } catch (error) {
      console.error('Error fetching complete order details:', error);
      return null;
    }
  };

  const handleTrackOrder = useCallback(async (orderIdToTrack?: string) => {
    const trackId = orderIdToTrack || orderId;
    
    if (!trackId.trim()) {
      toast({
        title: "Order ID Required",
        description: "Please enter your order ID to track your order.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First, get tracking information
      const response = await orderAPI.trackOrder(trackId);
      
      // Then, get complete order details
      const completeOrder = await fetchCompleteOrderDetails(trackId);
      
      // Check if response has data property (common API pattern)
      const orderData = response.data || response;
      
      // Handle different response structures
      if (response.success && response.data) {
        // Map backend response to our interface with complete order details
        const mappedData = {
          orderId: trackId,
          orderNumber: response.data.orderNumber,
          status: completeOrder?.orderStatus || 'processing',
          orderDate: completeOrder?.created_at || new Date().toISOString(),
          total: completeOrder?.totalPrice || 0,
          paymentMethod: completeOrder?.paymentMethod || 'unknown',
          customerName: 'Customer', // Default since not provided
          shippingAddress: completeOrder?.shippingAddress || {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
          },
          items: completeOrder?.orderItems || [],
          orderItems: completeOrder?.orderItems || [],
          trackingHistory: response.data.timeline?.map((event: TimelineEvent) => ({
            status: event.status,
            timestamp: event.date,
            description: event.description,
            location: ''
          })) || [],
          estimatedDelivery: '',
          trackingNumber: ''
        };
        setOrderData(mappedData);
      } else if (orderData._id || orderData.orderId) {

        setOrderData(orderData);
      } else {
        console.error('Unexpected response structure:', orderData);
        toast({
          title: "Invalid Response",
          description: "Received unexpected data format from server.",
          variant: "destructive",
        });
        setOrderData(null);
        return;
      }
      
      if (!orderIdToTrack) {
        // Update URL if tracking from search
        window.history.pushState({}, '', `/track-order/${trackId}`);
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Order tracking error:', error);
      
      let errorMessage = "Unable to track order. Please try again.";
      if (apiError.response?.status === 404) {
        errorMessage = "Order not found. Please check your order ID.";
      } else if (apiError.response?.status === 401) {
        errorMessage = "Please log in to track your order.";
      }
      
      toast({
        title: "Tracking Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setOrderData(null);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, toast]);

  // Auto-track if orderId is in URL
  useEffect(() => {
    if (urlOrderId) {
      handleTrackOrder(urlOrderId);
    }
  }, [urlOrderId, handleTrackOrder]);



  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'default';
      case 'shipped':
      case 'in_transit':
        return 'secondary';
      case 'processing':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return CheckCircle;
      case 'shipped':
      case 'in_transit':
        return Truck;
      case 'processing':
      case 'order placed':
        return Package;
      default:
        return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <Header />
      
      {/* Hero Section - More compact for mobile */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Package className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-primary" />
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">Track Your Order</h1>
            <p className="text-base md:text-xl text-muted-foreground">
              Enter your order ID to see real-time tracking information
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Search Section - More compact */}
        {!urlOrderId && (
          <Card className="max-w-lg mx-auto mb-6 md:mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl">
                <Search className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Find Your Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div>
                <Label htmlFor="orderId" className="text-sm">Order ID</Label>
                <Input
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g., YT-1234567890"
                  className="mt-1 h-10"
                />
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  You can find your order ID in the confirmation email
                </p>
              </div>
              <Button 
                onClick={() => handleTrackOrder()} 
                disabled={isLoading} 
                className="w-full h-10"
              >
                {isLoading ? 'Tracking...' : 'Track Order'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Order Details - Responsive grid */}
        {orderData && (
          <div className="grid lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Order Status - More compact */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-lg md:text-xl">Order #{orderData.orderId || orderData.orderNumber || 'N/A'}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(orderData.status || 'processing')} className="w-fit">
                      {(orderData.status || 'processing')?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Order Date</p>
                      <p className="font-medium text-sm md:text-base">
                        {orderData.orderDate ? new Date(orderData.orderDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-medium text-sm md:text-base">₹{orderData.total || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium text-sm md:text-base capitalize">{orderData.paymentMethod || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Tracking Timeline - More compact */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-base md:text-lg">Order Timeline</h4>
                    <div className="space-y-2 md:space-y-3">
                      {orderData.trackingHistory?.map((event: TrackingEvent, index: number) => {
                        const StatusIcon = getStatusIcon(event.status);
                        const isLatest = index === 0;
                        
                        return (
                          <div key={index} className="flex items-start gap-2 md:gap-3">
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isLatest 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              <StatusIcon className="h-3 w-3 md:h-4 md:w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <h5 className="font-medium text-sm md:text-base">{event.status || 'Unknown Status'}</h5>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                  {event.timestamp ? new Date(event.timestamp).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                              <p className="text-xs md:text-sm text-muted-foreground mt-1">{event.description || 'No description available'}</p>
                              {event.location && (
                                <p className="text-xs md:text-sm text-muted-foreground flex items-center mt-1">
                                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{event.location}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items - More compact */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg md:text-xl">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 md:space-y-4">
                    {(orderData.items || orderData.orderItems)?.length > 0 ? (
                      (orderData.items || orderData.orderItems)?.map((item: OrderItem, index: number) => (
                        <div key={index} className="flex items-center gap-3 md:gap-4 p-3 border rounded-lg">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {(item as ApiOrderItem).image ? (
                              <img 
                                src={(item as ApiOrderItem).image} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <Package className={`h-4 w-4 md:h-6 md:w-6 text-muted-foreground ${(item as ApiOrderItem).image ? 'hidden' : ''}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm md:text-base truncate">{item.name}</h4>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              Qty: {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-sm md:text-base">₹{item.price * item.quantity}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 md:py-8 text-muted-foreground">
                        <Package className="h-8 w-8 md:h-12 md:w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm md:text-base">No items found for this order</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Details - More compact */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg md:text-xl">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm md:text-base">
                    <p className="font-medium">{orderData.customerName}</p>
                    <p>{orderData.shippingAddress?.street}</p>
                    {orderData.shippingAddress?.apartment && (
                      <p>{orderData.shippingAddress.apartment}</p>
                    )}
                    <p>
                      {orderData.shippingAddress?.city}, {orderData.shippingAddress?.state} {orderData.shippingAddress?.pincode}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Stack on mobile */}
            <div className="space-y-4 md:space-y-6">
              {/* Quick Actions - More compact */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg md:text-xl">Order Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full h-9 md:h-10" 
                    onClick={() => {
                      // Generate and download PDF invoice
                      const invoiceData = {
                        orderId: orderData.orderId,
                        orderNumber: orderData.orderNumber,
                        orderDate: orderData.orderDate,
                        total: orderData.total || 0,
                        items: (orderData.orderItems || orderData.items || []).map(item => ({
                          name: item.name,
                          quantity: item.quantity,
                          price: item.price,
                          total: item.price * item.quantity
                        })),
                        shippingAddress: orderData.shippingAddress || {
                          street: '',
                          city: '',
                          state: '',
                          pincode: '',
                          country: 'India'
                        },
                        customerName: orderData.customerName,
                        paymentMethod: orderData.paymentMethod
                      };
                      
                      downloadInvoicePDF(invoiceData);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                  
                  {orderData.status?.toLowerCase() === 'processing' && (
                    <Button variant="outline" className="w-full h-9 md:h-10">
                      Cancel Order
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Expected Delivery - More compact */}
              {orderData.estimatedDelivery && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg md:text-xl">
                      <Clock className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      Expected Delivery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base md:text-lg font-medium">
                      {new Date(orderData.estimatedDelivery).toLocaleDateString()}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      We'll send you tracking updates via email and SMS
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Support - More compact */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg md:text-xl">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-3">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Questions about your order? Contact our support team.
                  </p>
                  
                  <Button variant="outline" className="w-full justify-start h-9 md:h-10" asChild>
                    <Link to="/contact">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Support
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start h-9 md:h-10">
                    <Phone className="h-4 w-4 mr-2" />
                    Call +91 98765 43210
                  </Button>
                </CardContent>
              </Card>

              {/* Back to Shop - More compact */}
              <Card>
                <CardContent className="p-4 md:p-6 text-center">
                  <h4 className="font-medium mb-2 text-base md:text-lg">Shop More Teas</h4>
                  <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                    Explore our complete tea collection
                  </p>
                  <Button className="w-full h-9 md:h-10" asChild>
                    <Link to="/shop">
                      Continue Shopping
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Back to Home - More compact */}
        {!orderData && urlOrderId && !isLoading && (
          <div className="text-center mt-6 md:mt-8">
            <Button variant="outline" asChild className="h-9 md:h-10">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TrackOrder;