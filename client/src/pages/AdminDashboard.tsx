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
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      delivered: "bg-blue-100 text-blue-800",
    };
    
    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 text-lg">Welcome back! Here's what's happening with your store.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-700">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          onClick={() => navigate('/admin/customers')}
          className="cursor-pointer transform transition-all duration-300 hover:scale-105"
        >
          <StatsCard
            title="Total Customers"
            value={stats.totalCustomers.toLocaleString()}
            change="+12% from last month"
            changeType="positive"
            icon={Users}
            loading={loading}
            className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-100 dark:border-gray-700"
          />
        </div>
        <div 
          onClick={() => navigate('/admin/products')}
          className="cursor-pointer transform transition-all duration-300 hover:scale-105"
        >
          <StatsCard
            title="Total Products"
            value={stats.totalProducts}
            change="+3 new this week"
            changeType="positive"
            icon={Package}
            loading={loading}
            className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-100 dark:border-gray-700"
          />
        </div>
        <div 
          onClick={() => navigate('/admin/orders')}
          className="cursor-pointer transform transition-all duration-300 hover:scale-105"
        >
          <StatsCard
            title="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            change="+8% from last month"
            changeType="positive"
            icon={ShoppingCart}
            loading={loading}
            className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-100 dark:border-gray-700"
          />
        </div>
        <div 
          onClick={() => navigate('/admin/orders')}
          className="cursor-pointer transform transition-all duration-300 hover:scale-105"
        >
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            change="+15% from last month"
            changeType="positive"
            icon={DollarSign}
            loading={loading}
            className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-100 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-t-2xl">
              <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                <Settings className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <Link to="/admin/products">
                <Button className="w-full justify-start h-12 text-left px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <Plus className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-semibold">Add New Product</div>
                    <div className="text-xs opacity-90">Create a new product listing</div>
                  </div>
                </Button>
              </Link>
              <Link to="/admin/orders">
                <Button className="w-full justify-start h-12 text-left px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <Eye className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-semibold">View Recent Orders</div>
                    <div className="text-xs opacity-90">Check latest order status</div>
                  </div>
                </Button>
              </Link>
              <Button className="w-full justify-start h-12 text-left px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <TrendingUp className="h-5 w-5 mr-3" />
                <div>
                  <div className="font-semibold">View Analytics</div>
                  <div className="text-xs opacity-90">Detailed performance metrics</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders and Users */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders Table */}
            <Card className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <CardHeader 
                className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-t-2xl cursor-pointer"
                onClick={() => navigate('/admin/orders')}
              >
                <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Recent Orders</span>
                  <span className="text-xs opacity-70">(Click to view all)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {recentOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 text-blue-800 dark:text-blue-200">
                          <th className="text-left p-4 font-semibold">Order #</th>
                          <th className="text-left p-4 font-semibold">Customer</th>
                          <th className="text-left p-4 font-semibold">Status</th>
                          <th className="text-left p-4 font-semibold">Total</th>
                          <th className="text-left p-4 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order: OrderActivity, idx) => (
                          <tr 
                            key={order._id} 
                            onClick={() => navigate(`/admin/orders`)}
                            className={`transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer ${idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"}`}
                          >
                            <td className="p-4 font-medium text-blue-600 dark:text-blue-400">{order.orderNumber}</td>
                            <td className="p-4">
                              <div className="font-medium">{order.user?.name}</div>
                              <div className="text-xs text-gray-500">{order.user?.email}</div>
                            </td>
                            <td className="p-4">{order.status && getStatusBadge(order.status)}</td>
                            <td className="p-4 font-semibold text-green-600 dark:text-green-400">{formatCurrency(order.totalPrice as number)}</td>
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recent orders</h3>
                    <p className="text-gray-500">Orders will appear here once they are placed.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Recent Users Table */}
            <Card className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <CardHeader 
                className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-t-2xl cursor-pointer"
                onClick={() => navigate('/admin/customers')}
              >
                <CardTitle className="flex items-center space-x-2 text-purple-800 dark:text-purple-200">
                  <Users className="h-5 w-5" />
                  <span>Recent Customers</span>
                  <span className="text-xs opacity-70">(Click to view all)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {recentUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 text-purple-800 dark:text-purple-200">
                          <th className="text-left p-4 font-semibold">Name</th>
                          <th className="text-left p-4 font-semibold">Email</th>
                          <th className="text-left p-4 font-semibold">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentUsers.map((user: UserActivity, idx) => (
                          <tr 
                            key={user._id} 
                            onClick={() => navigate(`/admin/customers`)}
                            className={`transition-all duration-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer ${idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"}`}
                          >
                            <td className="p-4 font-medium text-purple-600 dark:text-purple-400">{user.name}</td>
                            <td className="p-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recent customers</h3>
                    <p className="text-gray-500">New customer registrations will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Top Products */}
        <Card className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
          <CardHeader 
            className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-t-2xl cursor-pointer"
            onClick={() => navigate('/admin/products')}
          >
            <CardTitle className="flex items-center space-x-2 text-orange-800 dark:text-orange-200">
              <Package className="h-5 w-5" />
              <span>Top Performing Products</span>
              <span className="text-xs opacity-70">(Click to view all)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {analytics?.topProducts && Array.isArray(analytics.topProducts) && analytics.topProducts.length > 0 ? (
                (analytics.topProducts as TopProduct[]).map((product, index) => (
                  <div 
                    key={index} 
                    onClick={() => navigate('/admin/products')}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30 transition-all duration-300 border border-orange-200 dark:border-orange-700 cursor-pointer"
                  >
                    <div>
                      <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">{product.name}</span>
                      <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">Sold: {product.totalSold ?? '-'}</div>
                    </div>
                    <span className="font-bold text-orange-800 dark:text-orange-200">{formatCurrency(product.revenue)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No product data</h3>
                  <p className="text-gray-500">Product performance metrics will appear here.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Monthly Stats and Order Status Distribution */}
        <Card className="rounded-2xl shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
          <CardHeader 
            className="bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900 dark:to-teal-800 rounded-t-2xl cursor-pointer"
            onClick={() => navigate('/admin/orders')}
          >
            <CardTitle className="flex items-center space-x-2 text-teal-800 dark:text-teal-200">
              <TrendingUp className="h-5 w-5" />
              <span>Monthly Stats & Order Status</span>
              <span className="text-xs opacity-70">(Click to view all)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Monthly Stats */}
              <div>
                <h4 className="font-semibold mb-3 text-teal-800 dark:text-teal-200 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Monthly Orders & Revenue
                </h4>
                {analytics?.monthlyStats && Array.isArray(analytics.monthlyStats) && analytics.monthlyStats.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.monthlyStats.map((stat, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => navigate('/admin/orders')}
                        className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg border border-teal-200 dark:border-teal-700 cursor-pointer hover:from-teal-100 hover:to-teal-200 dark:hover:from-teal-900/30 dark:hover:to-teal-800/30 transition-all duration-300"
                      >
                        <span className="text-sm font-medium text-teal-800 dark:text-teal-200">
                          {stat._id?.year}/{stat._id?.month}
                        </span>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-teal-800 dark:text-teal-200">{stat.orders} orders</div>
                          <div className="text-xs text-teal-600 dark:text-teal-400">{formatCurrency(stat.revenue)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No monthly stats available</p>
                  </div>
                )}
              </div>
              {/* Order Status Distribution */}
              <div>
                <h4 className="font-semibold mb-3 text-teal-800 dark:text-teal-200 flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Order Status Distribution
                </h4>
                {analytics?.orderStatusDistribution && Array.isArray(analytics.orderStatusDistribution) && analytics.orderStatusDistribution.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.orderStatusDistribution.map((status, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => navigate('/admin/orders')}
                        className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg border border-teal-200 dark:border-teal-700 cursor-pointer hover:from-teal-100 hover:to-teal-200 dark:hover:from-teal-900/30 dark:hover:to-teal-800/30 transition-all duration-300"
                      >
                        <span className="text-sm font-medium text-teal-800 dark:text-teal-200 capitalize">
                          {status._id || 'Unknown'}
                        </span>
                        <span className="text-sm font-bold text-teal-800 dark:text-teal-200">{status.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No order status data available</p>
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