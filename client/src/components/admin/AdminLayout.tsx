import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Home,
  Bell,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import adminAPI from "@/services/admin";

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);

  const isActive = (path: string) => location.pathname === path;

  // Fetch new order count (pending + processing) for badge
  useEffect(() => {
    const fetchNewOrderCount = async () => {
      try {
        const response = await adminAPI.getAllOrders({ page: 1, limit: 100 });
        const orders = response.data.orders || [];
        
        // Calculate new orders (pending + processing)
        const newOrders = orders.filter((order: { status?: string }) => 
          order.status === 'pending' || order.status === 'processing'
        );
        
        setNewOrderCount(newOrders.length);
      } catch (error) {
        console.error('Failed to fetch new order count:', error);
        setNewOrderCount(0);
      }
    };

    fetchNewOrderCount();
  }, []);

  const sidebarItems = [
    { to: "/admin", label: "Dashboard", icon: BarChart3 },
    { to: "/admin/customers", label: "Customers", icon: Users },
    { to: "/admin/orders", label: "Orders", icon: ShoppingCart, badge: newOrderCount.toString() },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/logs", label: "Logs", icon: Bell },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        sticky top-0 left-0 z-40 w-64 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out h-screen flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">YT</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Yellow Tea</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="px-3 py-6 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`
                      flex items-center justify-between px-4 py-2 rounded-lg font-medium transition-all duration-200 group
                      ${isActive(item.to)
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 hover:shadow'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-all duration-200 group-hover:bg-green-200/60 ${isActive(item.to) ? 'bg-green-200/80 text-green-800' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="bg-red-100 text-red-600 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer - User Info */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-gradient-to-t from-white/90 via-white/80 to-transparent dark:from-gray-900/90 dark:via-gray-900/80">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {user?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email || 'admin@yellowtea.in'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-0 min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 shadow-md border-b border-gray-200 dark:border-gray-700 flex-shrink-0 backdrop-blur-md">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 w-80"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <Link to="/" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  View Site
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;