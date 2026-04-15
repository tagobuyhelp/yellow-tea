import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Download,
  ArrowRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { orderAPI } from '@/services/api';
import { downloadInvoicePDF } from '@/utils/pdfGenerator';

type OrderSuccessDetails = {
  orderId: string;
  _id?: string;
  orderNumber?: string;
  status?: string;
  items?: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  orderItems?: Array<{
    name: string;
    quantity: number;
    image?: string;
    price: number;
    product: string;
    _id: string;
  }>;
  shippingAddress?: {
    street: string;
    apartment?: string;
    city: string;
    state: string;
    pincode?: string;
    country: string;
  };
  deliveryOption?: string;
  total?: number;
  totalPrice?: number;
  [key: string]: unknown;
};

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState<OrderSuccessDetails | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If orderData is present in state, use it. Otherwise, fetch by orderId.
    const stateOrderData = location.state?.orderData;
    if (stateOrderData) {
      setOrderDetails({ orderId, ...stateOrderData, total: location.state?.total });
    } else if (orderId) {
      setLoading(true);
      // Try to fetch order details from backend
      orderAPI.trackOrder(orderId)
        .then((data) => {
          setOrderDetails({ orderId, ...data });
        })
        .catch((error: unknown) => {
          setOrderDetails(null);
        })
        .finally(() => setLoading(false));
    } else {
      navigate('/');
    }
  }, [location.state, orderId, navigate]);



  const handleTrackOrder = () => {
    navigate(`/track-order/${orderDetails.orderId}`);
  };

  if (loading || !orderDetails) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Loading order details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      {/* Success Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-green-800 dark:text-green-200 mb-4">
                Order Confirmed!
              </h1>
              <p className="text-xl text-green-700 dark:text-green-300">
                Thank you for your order. We'll start preparing your fresh tea right away.
              </p>
            </div>
            
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Order Number</p>
                    <p className="text-2xl font-bold text-primary">{orderDetails.orderId}</p>
                  </div>
                  <Separator orientation="vertical" className="h-12" />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold">₹{orderDetails.total}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button onClick={handleTrackOrder} className="flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Track Your Order
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Generate and download PDF invoice
                      const invoiceData = {
                        orderId: orderDetails.orderId,
                        orderNumber: orderDetails.orderNumber,
                        orderDate: (orderDetails.orderDate as string) || new Date().toISOString(),
                        total: orderDetails.total || orderDetails.totalPrice || 0,
                        items: (orderDetails.orderItems || orderDetails.items || []).map(item => ({
                          name: item.name,
                          quantity: item.quantity,
                          price: item.price,
                          total: 'total' in item ? item.total : (item.price || 0) * (item.quantity || 0)
                        })),
                        shippingAddress: orderDetails.shippingAddress || {
                          street: '',
                          city: '',
                          state: '',
                          pincode: '',
                          country: 'India'
                        },
                        customerName: 'Customer',
                        paymentMethod: orderDetails.paymentMethod as string
                      };
                      
                      downloadInvoicePDF(invoiceData);
                    }}
                    className="flex items-center"
                    title="Download PDF invoice"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* What's Next */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  What Happens Next
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Order Confirmed</h4>
                      <p className="text-sm text-muted-foreground">Your order has been received and is being processed.</p>
                      <Badge variant="secondary" className="mt-1">Complete</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Fresh Packaging</h4>
                      <p className="text-sm text-muted-foreground">Your tea is being freshly packed from our gardens.</p>
                      <Badge variant="outline" className="mt-1">In Progress</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full border border-muted-foreground/30 text-muted-foreground flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Shipped</h4>
                      <p className="text-sm text-muted-foreground">Your order will be shipped within 24-48 hours.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full border border-muted-foreground/30 text-muted-foreground flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground">Delivered</h4>
                      <p className="text-sm text-muted-foreground">Fresh tea delivered to your doorstep!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(orderDetails.orderItems || orderDetails.items)?.map((item: OrderSuccessDetails['orderItems'][number] | OrderSuccessDetails['items'][number], index: number) => (
                    <div key={'productId' in item ? item.productId : item._id || `item-${index}`} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{'total' in item ? item.total : (item.price || 0) * (item.quantity || 0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">Delivery Address</h4>
                    <div className="text-sm text-muted-foreground mt-1">
                      <p>{orderDetails.shippingAddress?.street}</p>
                      {orderDetails.shippingAddress?.apartment && (
                        <p>{orderDetails.shippingAddress.apartment}</p>
                      )}
                      <p>
                        {orderDetails.shippingAddress?.city}, {orderDetails.shippingAddress?.state} {orderDetails.shippingAddress?.pincode}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium">Delivery Option</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {orderDetails.deliveryOption?.replace('-', ' ')} Delivery
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Have questions about your order? We're here to help!
                </p>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/contact">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Support
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Call +91 98765 43210
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Continue Shopping */}
            <Card>
              <CardContent className="p-6 text-center">
                <h4 className="font-medium mb-2">Discover More Teas</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Explore our complete collection of premium teas
                </p>
                <Button className="w-full" asChild>
                  <Link to="/shop">
                    Continue Shopping
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Social Sharing */}
            <Card>
              <CardContent className="p-6 text-center">
                <h4 className="font-medium mb-2">Share Your Experience</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Follow us for tea tips and brewing guides
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm">Facebook</Button>
                  <Button variant="outline" size="sm">Instagram</Button>
                  <Button variant="outline" size="sm">Twitter</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderSuccess;