import React, { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Home,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Bell
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import adminAPI from "@/services/admin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("yt:adminDarkMode") === "true");
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

  useEffect(() => {
    localStorage.setItem("yt:adminDarkMode", String(darkMode));
  }, [darkMode]);

  const pageTitle = useMemo(() => {
    const pathname = location.pathname;
    if (pathname === "/admin") return "Dashboard";
    if (pathname.startsWith("/admin/products")) return "Products";
    if (pathname.startsWith("/admin/orders")) return "Orders";
    if (pathname.startsWith("/admin/customers")) return "Customers";
    if (pathname.startsWith("/admin/settings")) return "Settings";
    if (pathname.startsWith("/admin/logs")) return "Logs";
    return "Admin";
  }, [location.pathname]);

  const primaryNav = [
    { to: "/admin", label: "Dashboard", icon: BarChart3 },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/orders", label: "Orders", icon: ShoppingCart, badge: newOrderCount.toString() },
    { to: "/admin/customers", label: "Customers", icon: Users },
  ];

  const secondaryNav = [
    { to: "/admin/settings", label: "Settings", icon: Settings },
    { to: "/admin/logs", label: "Logs", icon: Bell },
  ];

  return (
    <div className={`min-h-screen flex font-sans admin-theme ${darkMode ? "dark" : ""}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 w-64 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
      `}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
          <Link to="/admin" className="flex items-center gap-3">
            <img
              src="/uploads/logos/YellowTeaLogoPng.png"
              alt="Yellow Tea"
              className="h-10 w-auto object-contain"
              loading="eager"
            />
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-yt-yellow/15 text-yt-text"
                      : "text-sidebar-foreground hover:bg-yt-yellow/10"
                  }`}
                >
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r ${active ? "bg-yt-yellow" : "bg-transparent"}`} />
                  <span className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${active ? "text-yt-text" : "text-muted-foreground group-hover:text-yt-text"}`} />
                    <span className={active ? "font-semibold" : "font-medium"}>{item.label}</span>
                  </span>
                  {item.badge && item.badge !== "0" && (
                    <Badge className="bg-yt-yellow text-yt-text border-0">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mt-6 border-t border-sidebar-border pt-4 space-y-1">
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-yt-yellow/15 text-yt-text"
                      : "text-sidebar-foreground hover:bg-yt-yellow/10"
                  }`}
                >
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r ${active ? "bg-yt-yellow" : "bg-transparent"}`} />
                  <span className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${active ? "text-yt-text" : "text-muted-foreground group-hover:text-yt-text"}`} />
                    <span className={active ? "font-semibold" : "font-medium"}>{item.label}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-yt-yellow/20 flex items-center justify-center text-yt-text font-semibold">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-sidebar-foreground">{user?.name || "Admin"}</div>
              <div className="truncate text-xs text-muted-foreground">{user?.email || "admin@yellowtea.in"}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border">
          <div className="h-16 px-4 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex flex-col">
                <div className="text-lg font-heading text-foreground leading-none">{pageTitle}</div>
                <div className="text-xs text-muted-foreground leading-none mt-1">Yellow Tea Admin</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-card">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-7 w-7 rounded-full bg-yt-yellow/20 flex items-center justify-center text-yt-text font-semibold text-xs">
                        {user?.name?.charAt(0) || "A"}
                      </span>
                      <span className="hidden sm:inline-flex flex-col items-start leading-none">
                        <span className="text-sm font-semibold text-foreground">{user?.name || "Admin"}</span>
                        <span className="text-xs text-muted-foreground">{user?.email || "admin@yellowtea.in"}</span>
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/" className="flex items-center">
                      <Home className="h-4 w-4 mr-2" />
                      View Site
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDarkMode((v) => !v)}>
                    Toggle Dark Mode
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-yt-error focus:text-yt-error">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] p-4 lg:p-8 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
