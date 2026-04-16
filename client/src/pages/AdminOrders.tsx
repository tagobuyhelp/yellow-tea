import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Search, 
  Eye, 
  Package, 
  Loader2, 
  Calendar, 
  User, 
  DollarSign, 
  MapPin, 
  Truck, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  Printer,
  Mail,
  Phone,
  CreditCard,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import adminAPI from "@/services/admin";

interface User {
  _id: string;
  name: string;
  email: string;
}
interface OrderItem {
  product: {
    image?: string;
    images?: string[];
    name?: string;
  };
  quantity: number;
  price: number;
}
interface ShippingAddress {
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}
interface Order {
  _id: string;
  orderNumber: string;
  user?: User;
  createdAt?: string;
  totalPrice: number;
  status: string;
  orderItems?: OrderItem[];
  paymentMethod?: string;
  shippingAddress?: ShippingAddress;
  itemsPrice?: number;
  taxPrice?: number;
  shippingPrice?: number;
}

const AdminOrders: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
    total: 0
  });

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
  ];

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
      };
  
      const response = await adminAPI.getAllOrders(params);
      
      setOrders(response.data.orders as Order[]);
      setTotalPages(response.data.pagination.totalPages);
      
      // Calculate order statistics
      const stats = {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        refunded: 0,
        total: response.data.orders.length
      };
      
      response.data.orders.forEach((order: Order) => {
        if (order.status) {
          stats[order.status as keyof typeof stats]++;
        }
      });
      
      setOrderStats(stats);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedStatus, toast]);

  useEffect(() => {

    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = (value: string) => {

    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleViewOrderDetails = async (order: Order) => {
    try {
      setLoading(true);

      const response = await adminAPI.getOrderById(order._id);
      
      setSelectedOrder(response.data as Order);
      setIsOrderDetailsOpen(true);
    } catch (error) {
      console.error('❌ Error fetching order details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setStatusLoading(orderId);
    try {

      const response = await adminAPI.updateOrderStatus(orderId, { status: newStatus });
      
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });
      fetchOrders();
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setStatusLoading(null);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const normalized = (status || '').toLowerCase();
    const colors = {
      pending: "bg-yt-yellow/15 text-yt-text border-yt-yellow/30",
      processing: "bg-yt-info/10 text-yt-info border-yt-info/20",
      shipped: "bg-yt-info/10 text-yt-info border-yt-info/20",
      delivered: "bg-yt-success/10 text-yt-success border-yt-success/20",
      cancelled: "bg-yt-error/10 text-yt-error border-yt-error/20",
      refunded: "bg-muted text-muted-foreground border-border",
    };
    return (
      <Badge variant="outline" className={colors[normalized as keyof typeof colors] || "bg-muted text-muted-foreground border-border"}>
        {normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : "Unknown"}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      case 'refunded': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "-" : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const printInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - Order #${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .customer-info, .order-info { flex: 1; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .items-table th { background-color: #f8f9fa; }
            .totals { margin-top: 30px; text-align: right; }
            .total-row { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Yellow Tea - Invoice</h1>
            <h2>Order #${order.orderNumber}</h2>
          </div>
          
          <div class="invoice-details">
            <div class="customer-info">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${order.user?.name || 'N/A'}</p>
              <p><strong>Email:</strong> ${order.user?.email || 'N/A'}</p>
              <p><strong>Phone:</strong> ${order.shippingAddress?.phone || 'N/A'}</p>
            </div>
            <div class="order-info">
              <h3>Order Information</h3>
              <p><strong>Order Date:</strong> ${formatDate(order.createdAt || '')}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod || 'N/A'}</p>
            </div>
          </div>
          
          <div class="shipping-info">
            <h3>Shipping Address</h3>
            <p>${order.shippingAddress?.address || 'N/A'}</p>
            <p>${order.shippingAddress?.city || ''}, ${order.shippingAddress?.postalCode || ''}</p>
            <p>${order.shippingAddress?.country || 'N/A'}</p>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems?.map(item => `
                <tr>
                  <td>${item.product?.name || 'N/A'}</td>
                  <td>${item.quantity}</td>
                  <td>${formatPrice(item.price)}</td>
                  <td>${formatPrice(item.price * item.quantity)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          
          <div class="totals">
            <p><strong>Subtotal:</strong> ${formatPrice(order.itemsPrice || 0)}</p>
            <p><strong>Tax:</strong> ${formatPrice(order.taxPrice || 0)}</p>
            <p><strong>Shipping:</strong> ${formatPrice(order.shippingPrice || 0)}</p>
            <p class="total-row">Total: ${formatPrice(order.totalPrice)}</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground">Order Management</h1>
          <p className="text-muted-foreground mt-1">Manage and track all customer orders</p>
          
          {/* Order Statistics */}
          <div className="grid grid-cols-7 gap-2 mt-4">
            <Card className="rounded-lg shadow-sm border border-border bg-card">
              <CardContent className="p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="h-4 w-4 text-yt-yellow" />
                </div>
                <p className="text-lg font-bold text-foreground">{orderStats.pending}</p>
                <p className="text-xs text-muted-foreground font-medium">Pending</p>
              </CardContent>
            </Card>
            
            <Card className="rounded-lg shadow-sm border border-border bg-card">
              <CardContent className="p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Loader2 className="h-4 w-4 text-yt-info" />
                </div>
                <p className="text-lg font-bold text-foreground">{orderStats.processing}</p>
                <p className="text-xs text-muted-foreground font-medium">Processing</p>
              </CardContent>
            </Card>
            
            <Card className="rounded-lg shadow-sm border border-border bg-card">
              <CardContent className="p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Truck className="h-4 w-4 text-yt-info" />
                </div>
                <p className="text-lg font-bold text-foreground">{orderStats.shipped}</p>
                <p className="text-xs text-muted-foreground font-medium">Shipped</p>
              </CardContent>
            </Card>
            
            <Card className="rounded-lg shadow-sm border border-border bg-card">
              <CardContent className="p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className="h-4 w-4 text-yt-success" />
                </div>
                <p className="text-lg font-bold text-foreground">{orderStats.delivered}</p>
                <p className="text-xs text-muted-foreground font-medium">Delivered</p>
              </CardContent>
            </Card>
            
            <Card className="rounded-lg shadow-sm border border-border bg-card">
              <CardContent className="p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <X className="h-4 w-4 text-yt-error" />
                </div>
                <p className="text-lg font-bold text-foreground">{orderStats.cancelled}</p>
                <p className="text-xs text-muted-foreground font-medium">Cancelled</p>
              </CardContent>
            </Card>
            
            <Card className="rounded-lg shadow-sm border border-border bg-card">
              <CardContent className="p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-lg font-bold text-foreground">{orderStats.refunded}</p>
                <p className="text-xs text-muted-foreground font-medium">Refunded</p>
              </CardContent>
            </Card>
            
            <Card className="rounded-lg shadow-sm border border-border bg-card">
              <CardContent className="p-2 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Package className="h-4 w-4 text-foreground" />
                </div>
                <p className="text-lg font-bold text-foreground">{orderStats.total}</p>
                <p className="text-xs text-muted-foreground font-medium">Total</p>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold text-foreground">{orderStats.total}</p>
          </div>
        </div>
      </div>



      {/* Filters */}
      <Card className="rounded-xl shadow-sm">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium text-foreground">Search Orders</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by order number, customer name..."
                  value={searchTerm}
                  onChange={(e) => {
                
                    setSearchTerm(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="status" className="text-sm font-medium text-foreground">Status Filter</Label>
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Collapsible
            key={order._id}
            open={expandedOrders.has(order._id)}
            onOpenChange={() => toggleOrderExpansion(order._id)}
          >
            <Card className="rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/40 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {expandedOrders.has(order._id) ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">#{order.orderNumber}</h3>
                        <p className="text-sm text-muted-foreground">{order.user?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">{formatPrice(order.totalPrice)}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(order.createdAt || '')}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrderDetails(order);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            printInvoice(order);
                          }}
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          Invoice
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Customer & Shipping Info */}
                    <div className="space-y-4">
                      <Card className="border-border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-heading flex items-center space-x-2">
                            <User className="h-5 w-5 text-yt-info" />
                            <span>Customer Information</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{order.user?.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{order.user?.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{order.shippingAddress?.phone || 'N/A'}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-heading flex items-center space-x-2">
                            <MapPin className="h-5 w-5 text-yt-success" />
                            <span>Shipping Address</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm">{order.shippingAddress?.address}</p>
                          <p className="text-sm">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                          <p className="text-sm">{order.shippingAddress?.country}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Order Items */}
                    <div className="lg:col-span-2">
                      <Card className="border-border">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-heading flex items-center space-x-2">
                            <ShoppingBag className="h-5 w-5 text-yt-info" />
                            <span>Order Items</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {order.orderItems?.map((item: OrderItem, index: number) => (
                              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                <img
                                  src={item.product?.images[0]}
                                  alt={item.product?.name}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                                  <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-900">{formatPrice(item.price)}</p>
                                  <p className="text-sm text-gray-500">Total: {formatPrice(item.price * item.quantity)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Order Summary & Actions */}
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span>Order Summary</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span>{formatPrice(order.itemsPrice || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax:</span>
                          <span>{formatPrice(order.taxPrice || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping:</span>
                          <span>{formatPrice(order.shippingPrice || 0)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-3">
                          <span>Total:</span>
                          <span className="text-green-600">{formatPrice(order.totalPrice)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <span>Payment & Status</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
                          <p className="mt-1">{order.paymentMethod || 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Order Status</Label>
                          <div className="mt-2 flex items-center space-x-3">
                            <Select
                              value={order.status || "pending"}
                              onValueChange={(value) => {
                                
                                handleStatusUpdate(order._id, value);
                              }}
                              disabled={!!statusLoading}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.filter(opt => opt.value !== "all").map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {statusLoading === order._id && <Loader2 className="h-4 w-4 animate-spin" />}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => printInvoice(order)}
                            className="flex-1 border-gray-300 hover:border-green-500 hover:bg-green-50"
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Print Invoice
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleViewOrderDetails(order);
                            }}
                            className="flex-1 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Full Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="rounded-2xl shadow-lg border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentPage(currentPage - 1);
                }}
                disabled={currentPage === 1}
                className="border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              >
                Previous
              </Button>
              <div className="flex items-center px-6 py-2 bg-gray-100 rounded-lg">
                <span className="font-medium">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentPage(currentPage + 1);
                }}
                disabled={currentPage === totalPages}
                className="border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Order Details - #{selectedOrder?.orderNumber}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Order Number</Label>
                      <p className="font-medium">#{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <Label>Order Date</Label>
                      <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                    </div>
                    <div>
                      <Label>Payment Method</Label>
                      <p className="font-medium">{selectedOrder.paymentMethod}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <p className="font-medium">{selectedOrder.user?.name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="font-medium">{selectedOrder.user?.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{selectedOrder.shippingAddress?.address}</p>
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                  <p>{selectedOrder.shippingAddress?.country}</p>
                  <p>Phone: {selectedOrder.shippingAddress?.phone}</p>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.orderItems?.map((item: OrderItem, index: number) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border rounded">
                        <img
                          src={item.product?.images[0]}
                          alt={item.product?.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product?.name}</h4>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(item.price)}</p>
                          <p className="text-sm text-gray-500">Total: {formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Totals */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Totals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatPrice(selectedOrder.itemsPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatPrice(selectedOrder.taxPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{formatPrice(selectedOrder.shippingPrice)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatPrice(selectedOrder.totalPrice)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders; 
