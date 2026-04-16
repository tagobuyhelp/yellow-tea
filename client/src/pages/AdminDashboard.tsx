import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/admin/StatsCard";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Plus,
  Eye,
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import adminAPI from "@/services/admin";

// Add types for recent activity and analytics
interface Activity {
  id?: string | number;
  type: string;
  message?: string;
  time?: string;
  status?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  [key: string]: unknown;
}
interface Analytics {
  topProducts?: Array<{ name: string; revenue: number; trend?: string }>;
  [key: string]: unknown;
}
interface OrderActivity {
  _id: string;
  orderNumber: string;
  user?: { name?: string; email?: string };
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  status?: string;
  totalPrice?: number;
  [key: string]: unknown;
}
interface UserActivity {
  _id: string;
  name: string;
  email?: string;
  created_at?: string;
  createdAt?: string;
  [key: string]: unknown;
}
// Add TopProduct type
interface TopProduct {
  name: string;
  revenue: number;
  totalSold?: number;
  trend?: string;
}

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    deliveredToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  // Fetch dashboard analytics from adminAPI
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      const overview = response.data?.overview || {};
      const statsData = {
        totalCustomers: overview.totalUsers || 0,
        totalProducts: overview.totalProducts || 0,
        totalOrders: overview.totalOrders || 0,
        totalRevenue: overview.totalRevenue || 0,
        recentOrders: response.data?.analytics?.recentOrders || 0,
        pendingOrders: response.data?.analytics?.ordersByStatus?.pending || 0,
        processingOrders: response.data?.analytics?.ordersByStatus?.processing || 0,
        deliveredToday: response.data?.analytics?.ordersByStatus?.deliveredToday || 0,
      };
      setStats(statsData);
      // Merge orders and users into a single activity feed
      
      const orders = Array.isArray(response.data?.recentActivity?.orders)
        ? response.data.recentActivity.orders.map((order: OrderActivity) => ({
            ...order,
            type: 'order',
            message: `Order #${order.orderNumber} by ${order.user?.name || 'Unknown'}`,
            time: order.created_at || order.createdAt || order.updated_at || '',
            status: order.status
          }))
        : [];
      const users = Array.isArray(response.data?.recentActivity?.users)
        ? response.data.recentActivity.users.map((user: UserActivity) => ({
            ...user,
            type: 'user',
            message: `New user: ${user.name}`,
            time: user.created_at || user.createdAt || '',
            status: ''
          }))
        : [];
      
      const activity: Activity[] = [...orders, ...users].sort((a, b) => new Date(b.time || b.created_at || b.createdAt || 0).getTime() - new Date(a.time || a.created_at || a.createdAt || 0).getTime());
      setRecentActivity(activity);
      setAnalytics(response.data?.analytics || null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-4 w-4" />;
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'product':
        return <Package className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const normalized = (status || '').toLowerCase();

    const styles: Record<string, string> = {
      pending: "bg-yt-yellow/15 text-yt-text border-yt-yellow/30",
      processing: "bg-yt-info/10 text-yt-info border-yt-info/20",
      completed: "bg-yt-success/10 text-yt-success border-yt-success/20",
      delivered: "bg-yt-success/10 text-yt-success border-yt-success/20",
      cancelled: "bg-yt-error/10 text-yt-error border-yt-error/20",
    };

    return (
      <Badge variant="outline" className={styles[normalized] || "bg-muted text-muted-foreground border-border"}>
        {normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : "Unknown"}
      </Badge>
    );
  };

  // Derive recentOrders and recentUsers from analytics or recentActivity state
  const recentOrders: OrderActivity[] = Array.isArray(recentActivity)
    ? (recentActivity.filter((a) => a.type === 'order') as unknown as OrderActivity[])
    : Array.isArray(analytics?.recentOrders)
      ? (analytics.recentOrders as OrderActivity[])
      : [];
  const recentUsers: UserActivity[] = Array.isArray(recentActivity)
    ? (recentActivity.filter((a) => a.type === 'user') as unknown as UserActivity[])
    : Array.isArray(analytics?.recentUsers)
      ? (analytics.recentUsers as UserActivity[])
      : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground leading-tight">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Store overview, recent activity, and key performance signals.
          </p>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-xs text-muted-foreground">Last updated</div>
            <div className="text-sm font-medium text-foreground">{new Date().toLocaleTimeString()}</div>
          </div>
          <div className="h-2.5 w-2.5 rounded-full bg-yt-success/80" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => navigate('/admin/customers')} className="text-left">
          <StatsCard
            title="Total Customers"
            value={stats.totalCustomers.toLocaleString()}
            change="+12% from last month"
            changeType="positive"
            icon={Users}
            loading={loading}
            className="rounded-xl hover:shadow-md transition-shadow"
          />
        </button>
        <button onClick={() => navigate('/admin/products')} className="text-left">
          <StatsCard
            title="Total Products"
            value={stats.totalProducts}
            change="+3 new this week"
            changeType="positive"
            icon={Package}
            loading={loading}
            className="rounded-xl hover:shadow-md transition-shadow"
          />
        </button>
        <button onClick={() => navigate('/admin/orders')} className="text-left">
          <StatsCard
            title="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            change="+8% from last month"
            changeType="positive"
            icon={ShoppingCart}
            loading={loading}
            className="rounded-xl hover:shadow-md transition-shadow"
          />
        </button>
        <button onClick={() => navigate('/admin/orders')} className="text-left">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            change="+15% from last month"
            changeType="positive"
            icon={DollarSign}
            loading={loading}
            className="rounded-xl hover:shadow-md transition-shadow"
          />
        </button>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center space-x-2 font-heading text-base text-foreground">
                <Settings className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/products">
                <Button className="w-full justify-start h-11 text-left px-4">
                  <Plus className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-semibold">Add New Product</div>
                    <div className="text-xs text-yt-text-secondary">Create a new product listing</div>
                  </div>
                </Button>
              </Link>
              <Link to="/admin/orders">
                <Button variant="outline" className="w-full justify-start h-11 text-left px-4">
                  <Eye className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-semibold">View Recent Orders</div>
                    <div className="text-xs text-yt-text-secondary">Check latest order status</div>
                  </div>
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start h-11 text-left px-4">
                <TrendingUp className="h-5 w-5 mr-3" />
                <div>
                  <div className="font-semibold">View Analytics</div>
                  <div className="text-xs text-yt-text-secondary">Detailed performance metrics</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders and Users */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders Table */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="border-b border-border cursor-pointer" onClick={() => navigate('/admin/orders')}>
                <CardTitle className="flex items-center space-x-2 font-heading text-base text-foreground">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Recent Orders</span>
                  <span className="text-xs text-muted-foreground">(Click to view all)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {recentOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/40 text-muted-foreground">
                          <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Order</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Customer</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Status</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Total</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order: OrderActivity, idx) => (
                          <tr 
                            key={order._id} 
                            onClick={() => navigate(`/admin/orders`)}
                            className={`transition-colors hover:bg-muted/40 cursor-pointer ${idx !== recentOrders.length - 1 ? "border-b border-border" : ""}`}
                          >
                            <td className="px-4 py-3 font-medium text-yt-info">{order.orderNumber}</td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-foreground">{order.user?.name}</div>
                              <div className="text-xs text-muted-foreground">{order.user?.email}</div>
                            </td>
                            <td className="px-4 py-3">{order.status && getStatusBadge(order.status)}</td>
                            <td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(order.totalPrice as number)}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-base font-heading font-medium text-foreground mb-1">No recent orders</h3>
                    <p className="text-sm text-muted-foreground">Orders will appear here once they are placed.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Recent Users Table */}
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="border-b border-border cursor-pointer" onClick={() => navigate('/admin/customers')}>
                <CardTitle className="flex items-center space-x-2 font-heading text-base text-foreground">
                  <Users className="h-5 w-5" />
                  <span>Recent Customers</span>
                  <span className="text-xs text-muted-foreground">(Click to view all)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {recentUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/40 text-muted-foreground">
                          <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Name</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Email</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentUsers.map((user: UserActivity, idx) => (
                          <tr 
                            key={user._id} 
                            onClick={() => navigate(`/admin/customers`)}
                            className={`transition-colors hover:bg-muted/40 cursor-pointer ${idx !== recentUsers.length - 1 ? "border-b border-border" : ""}`}
                          >
                            <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-base font-heading font-medium text-foreground mb-1">No recent customers</h3>
                    <p className="text-sm text-muted-foreground">New customer registrations will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="border-b border-border cursor-pointer" onClick={() => navigate('/admin/products')}>
            <CardTitle className="flex items-center space-x-2 font-heading text-base text-foreground">
              <Package className="h-5 w-5" />
              <span>Top Performing Products</span>
              <span className="text-xs text-muted-foreground">(Click to view all)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {analytics?.topProducts && Array.isArray(analytics.topProducts) && analytics.topProducts.length > 0 ? (
                (analytics.topProducts as TopProduct[]).map((product, index) => (
                  <div 
                    key={index} 
                    onClick={() => navigate('/admin/products')}
                    className="flex justify-between items-center p-4 bg-muted/30 rounded-xl hover:bg-muted/40 transition-colors border border-border cursor-pointer"
                  >
                    <div>
                      <span className="text-sm font-semibold text-foreground">{product.name}</span>
                      <div className="text-xs text-muted-foreground font-medium">Sold: {product.totalSold ?? '-'}</div>
                    </div>
                    <span className="font-bold text-foreground">{formatCurrency(product.revenue)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-base font-heading font-medium text-foreground mb-1">No product data</h3>
                  <p className="text-sm text-muted-foreground">Product performance metrics will appear here.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Monthly Stats and Order Status Distribution */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="border-b border-border cursor-pointer" onClick={() => navigate('/admin/orders')}>
            <CardTitle className="flex items-center space-x-2 font-heading text-base text-foreground">
              <TrendingUp className="h-5 w-5" />
              <span>Monthly Stats & Order Status</span>
              <span className="text-xs text-muted-foreground">(Click to view all)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              {/* Monthly Stats */}
              <div>
                <h4 className="font-heading font-medium mb-3 text-foreground flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                  Monthly Orders & Revenue
                </h4>
                {analytics?.monthlyStats && Array.isArray(analytics.monthlyStats) && analytics.monthlyStats.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.monthlyStats.map((stat, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => navigate('/admin/orders')}
                        className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border cursor-pointer hover:bg-muted/40 transition-colors"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {stat._id?.year}/{stat._id?.month}
                        </span>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-foreground">{stat.orders} orders</div>
                          <div className="text-xs text-muted-foreground">{formatCurrency(stat.revenue)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No monthly stats available</p>
                  </div>
                )}
              </div>
              {/* Order Status Distribution */}
              <div>
                <h4 className="font-heading font-medium mb-3 text-foreground flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                  Order Status Distribution
                </h4>
                {analytics?.orderStatusDistribution && Array.isArray(analytics.orderStatusDistribution) && analytics.orderStatusDistribution.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.orderStatusDistribution.map((status, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => navigate('/admin/orders')}
                        className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border cursor-pointer hover:bg-muted/40 transition-colors"
                      >
                        <span className="text-sm font-medium text-foreground capitalize">
                          {status._id || 'Unknown'}
                        </span>
                        <span className="text-sm font-bold text-foreground">{status.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No order status data available</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard; 
