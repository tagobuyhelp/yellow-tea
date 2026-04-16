import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Store, Phone, Info, ShoppingBag, User, LogOut, Heart, List, UserCircle, LogIn, ChevronDown, Package, Leaf, MapPin, Clock, Star, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const navigationItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Shop Tea', href: '/shop', icon: Store, hasMegaMenu: true },
  { name: 'Gifts', href: '/gifts', icon: Gift },
  { name: 'Trial Packs', href: '/trialpacks', icon: Package },
  { name: 'About', href: '/about', icon: Info },
  { name: 'Contact', href: '/contact', icon: Phone },
];

const shopCategories = {
  category: [
    { name: 'Trial Packs', href: '/shop?category=trial-packs', icon: Package, description: 'Perfect for beginners' },
    { name: 'Full-sized', href: '/shop?category=full-sized', icon: Package, description: 'Complete tea experience' },
    { name: 'Gift Boxes', href: '/shop?category=gift-boxes', icon: Gift, description: 'Perfect for gifting' },
  ],
  type: [
    { name: 'Black', href: '/shop?type=black', icon: Leaf, description: 'Bold & robust flavors' },
    { name: 'Green', href: '/shop?type=green', icon: Leaf, description: 'Fresh & delicate' },
    { name: 'White', href: '/shop?type=white', icon: Leaf, description: 'Subtle & refined' },
    { name: 'Oolong', href: '/shop?type=oolong', icon: Leaf, description: 'Complex & aromatic' },
    { name: 'Herbals/Tisanes', href: '/shop?type=herbals', icon: Leaf, description: 'Natural wellness' },
    { name: 'Breakfast', href: '/shop?type=breakfast', icon: Leaf, description: 'Strong morning blend' },
    { name: 'Masala Tea', href: '/shop?type=masala', icon: Leaf, description: 'Spiced & warming' },
    { name: 'Matcha', href: '/shop?type=matcha', icon: Leaf, description: 'Premium powdered green' },
  ],
  flush: [
    { name: 'First/Spring', href: '/shop?flush=first', icon: Clock, description: 'Fresh spring harvest' },
    { name: 'Second/Summer', href: '/shop?flush=second', icon: Clock, description: 'Rich summer flavors' },
    { name: 'Third/Autumn', href: '/shop?flush=third', icon: Clock, description: 'Mature autumn notes' },
    { name: 'Fourth/Winter', href: '/shop?flush=fourth', icon: Clock, description: 'Winter special' },
  ],
  region: [
    { name: 'Darjeeling', href: '/shop?region=darjeeling', icon: MapPin, description: 'Himalayan highlands' },
    { name: 'Assam', href: '/shop?region=assam', icon: MapPin, description: 'Brahmaputra valley' },
    { name: 'Sikkim', href: '/shop?region=sikkim', icon: MapPin, description: 'Eastern Himalayas' },
    { name: 'Nilgiri', href: '/shop?region=nilgiri', icon: MapPin, description: 'Blue mountains' },
  ],
  packaging: [
    { name: 'Whole leaf', href: '/shop?packaging=whole-leaf', icon: Package, description: 'Premium loose leaf' },
    { name: 'Teabags', href: '/shop?packaging=teabags', icon: Package, description: 'Convenient & quick' },
  ],
  featured: [
    { name: 'Best Seller', href: '/shop?featured=best-seller', icon: Star, description: 'Most popular teas' },
  ],
};

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
  const location = useLocation();
  const { items } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleShopMenu = () => {
    setIsShopMenuOpen(!isShopMenuOpen);
  };

  const closeShopMenu = () => {
    setIsShopMenuOpen(false);
  };

  const handleShopClick = () => {
    navigate('/shop');
  };

  const handleShopItemClick = (href: string) => {
    closeShopMenu();
    navigate(href);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  // Profile menu actions
  const handleProfileMenu = (path: string) => {
    closeMobileMenu();
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeMobileMenu();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 bg-white supports-[backdrop-filter]:bg-background/95">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              onClick={closeMobileMenu}
            >
              <img 
                src="/uploads/logos/YellowTeaLogoPng.png" 
                alt="Yellow Tea Logo" 
                className="h-10 w-auto object-contain"
              />
              <span className="font-medium font-display  text-2xl  text-foreground sm:block"> <span className="text-yellow-500"> Yellow </span> Tea </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                
                if (item.hasMegaMenu) {
                  return (
                    <div key={item.name} className="relative group">
                      <div className="flex items-center">
                        <Link
                          to={item.href}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary ${
                            isActiveRoute(item.href)
                              ? 'text-primary bg-primary/10'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <Icon size={16} />
                          <span>{item.name}</span>
                        </Link>
                        <button
                          onClick={toggleShopMenu}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <ChevronDown size={14} className={`transition-transform ${isShopMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                      
                      {/* Mega Menu - Centered */}
                      {isShopMenuOpen && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-screen max-w-3xl bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1">
                          <div className="p-6">
                            {/* Header */}
                            <div className="mb-3 pb-2 border-b border-gray-100">
                              <h2 className="text-lg font-bold text-gray-900">Shop by Category</h2>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                              {/* Category */}
                              <div>
                                <div className="flex items-center gap-1 mb-1">
                                  <Package className="h-4 w-4 text-yellow-600" />
                                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Category</h3>
                                </div>
                                <ul className="space-y-0.5">
                                  {shopCategories.category.map((category) => {
                                    return (
                                      <li key={category.name}>
                                        <button
                                          onClick={() => handleShopItemClick(category.href)}
                                          className="group flex items-center p-1.5 rounded-sm hover:bg-yellow-50 hover:border-yellow-200 border border-transparent transition-all duration-200 w-full text-left"
                                        >
                                          <div className="font-medium text-gray-900 group-hover:text-yellow-700 transition-colors text-sm">
                                            {category.name}
                                          </div>
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>

                              {/* Type */}
                              <div>
                                <div className="flex items-center gap-1 mb-1">
                                  <Leaf className="h-4 w-4 text-green-600" />
                                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Type</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-x-2">
                                  <ul className="space-y-0.5">
                                    {shopCategories.type.slice(0, 4).map((type) => {
                                      return (
                                        <li key={type.name}>
                                          <button
                                            onClick={() => handleShopItemClick(type.href)}
                                            className="group flex items-center p-1.5 rounded-sm hover:bg-green-50 hover:border-green-200 border border-transparent transition-all duration-200 w-full text-left"
                                          >
                                            <div className="font-medium text-gray-900 group-hover:text-green-700 transition-colors text-sm">
                                              {type.name}
                                            </div>
                                          </button>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                  <ul className="space-y-0.5">
                                    {shopCategories.type.slice(4).map((type) => {
                                      return (
                                        <li key={type.name}>
                                          <button
                                            onClick={() => handleShopItemClick(type.href)}
                                            className="group flex items-center p-1.5 rounded-sm hover:bg-green-50 hover:border-green-200 border border-transparent transition-all duration-200 w-full text-left"
                                          >
                                            <div className="font-medium text-gray-900 group-hover:text-green-700 transition-colors text-sm">
                                              {type.name}
                                            </div>
                                          </button>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              </div>

                              {/* Flush/Season */}
                              <div>
                                <div className="flex items-center gap-1 mb-1">
                                  <Clock className="h-4 w-4 text-blue-600" />
                                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Flush/Season</h3>
                                </div>
                                <ul className="space-y-0.5">
                                  {shopCategories.flush.map((flush) => {
                                    return (
                                      <li key={flush.name}>
                                        <button
                                          onClick={() => handleShopItemClick(flush.href)}
                                          className="group flex items-center p-1.5 rounded-sm hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 w-full text-left"
                                        >
                                          <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors text-sm">
                                            {flush.name}
                                          </div>
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>

                              {/* Region */}
                              <div>
                                <div className="flex items-center gap-1 mb-1">
                                  <MapPin className="h-4 w-4 text-red-600" />
                                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Region</h3>
                                </div>
                                <ul className="space-y-0.5">
                                  {shopCategories.region.map((region) => {
                                    return (
                                      <li key={region.name}>
                                        <button
                                          onClick={() => handleShopItemClick(region.href)}
                                          className="group flex items-center p-1.5 rounded-sm hover:bg-red-50 hover:border-red-200 border border-transparent transition-all duration-200 w-full text-left"
                                        >
                                          <div className="font-medium text-gray-900 group-hover:text-red-700 transition-colors text-sm">
                                            {region.name}
                                          </div>
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>

                              {/* Packaging */}
                              <div>
                                <div className="flex items-center gap-1 mb-1">
                                  <Package className="h-4 w-4 text-purple-600" />
                                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Packaging</h3>
                                </div>
                                <ul className="space-y-0.5">
                                  {shopCategories.packaging.map((packaging) => {
                                    return (
                                      <li key={packaging.name}>
                                        <button
                                          onClick={() => handleShopItemClick(packaging.href)}
                                          className="group flex items-center p-1.5 rounded-sm hover:bg-purple-50 hover:border-purple-200 border border-transparent transition-all duration-200 w-full text-left"
                                        >
                                          <div className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors text-sm">
                                            {packaging.name}
                                          </div>
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>

                              {/* Featured */}
                              <div>
                                <div className="flex items-center gap-1 mb-1">
                                  <Star className="h-4 w-4 text-orange-600" />
                                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Featured</h3>
                                </div>
                                <ul className="space-y-0.5">
                                  {shopCategories.featured.map((featured) => {
                                    return (
                                      <li key={featured.name}>
                                        <button
                                          onClick={() => handleShopItemClick(featured.href)}
                                          className="group flex items-center p-1.5 rounded-sm hover:bg-orange-50 hover:border-orange-200 border border-transparent transition-all duration-200 w-full text-left"
                                        >
                                          <div className="font-medium text-gray-900 group-hover:text-orange-700 transition-colors text-sm">
                                            {featured.name}
                                          </div>
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            </div>
                            
                            {/* Footer */}
                            <div className="mt-2 pt-1 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">Premium Indian tea collection</p>
                                <Link
                                  to="/shop"
                                  onClick={closeShopMenu}
                                  className="text-sm font-medium text-yellow-600 hover:text-yellow-700 transition-colors"
                                >
                                  View All →
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary ${
                      isActiveRoute(item.href)
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              {/* Cart Icon */}
              <Link to="/cart">
                <Button variant="secondary" size="sm" className="flex items-center space-x-2">
                  <ShoppingBag size={16} />
                  <span className="hidden lg:inline">Cart</span>
                  <span className="bg-yellow-400 text-black rounded-full text-xs px-2 py-0.5 ml-1">
                    {cartItemCount}
                  </span>
                </Button>
              </Link>
              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-2">
                    <UserCircle size={24} />
                    <span className="sr-only">Open profile menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user ? (
                    <>
                      <DropdownMenuItem onClick={() => handleProfileMenu('/profile')}>
                        <User size={16} className="mr-2" /> Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleProfileMenu('/profile')}>
                        <List size={16} className="mr-2" /> Orders
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleProfileMenu('/wishlist')}>
                        <Heart size={16} className="mr-2" /> Wishlist
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut size={16} className="mr-2" /> Logout
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => handleProfileMenu('/login')}>
                        <LogIn size={16} className="mr-2" /> Login
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleProfileMenu('/register')}>
                        <User size={16} className="mr-2" /> Register
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Mobile Menu Button with Yellow & Green Branding */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden bg-green-600 hover:bg-yellow-400 text-black rounded-lg p-2 transition-all duration-200 hover:scale-105 "
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X size={20} className="text-white" />
              ) : (
                <Menu size={20} className="text-white" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Sidebar Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          <div className="flex items-center space-x-3">
            <img 
              src="/uploads/site_logo_2.jpg" 
              alt="Yellow Tea Logo" 
              className="h-8 w-auto object-contain"
            />
            <span className="font-bold text-lg text-black">Yellow Tea</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeMobileMenu}
            className="text-yellow-700 hover:bg-yellow-200 rounded-lg p-2"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col h-full">
          {/* Navigation Items */}
          <nav className="flex-1 py-4">
            <div className="px-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                
                if (item.hasMegaMenu) {
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between">
                        <Link
                          to={item.href}
                          onClick={closeMobileMenu}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 flex-1 ${
                            isActiveRoute(item.href)
                              ? 'text-black bg-green-100 border-l-4 border-green-500 shadow-sm'
                              : 'text-yellow-700 hover:text-yellow-800 hover:bg-yellow-50'
                          }`}
                        >
                          <Icon size={20} className="text-green-600" />
                          <span>{item.name}</span>
                        </Link>
                        <button
                          onClick={toggleShopMenu}
                          className="p-2 hover:bg-yellow-50 rounded transition-colors"
                        >
                          <ChevronDown size={16} className={`transition-transform ${isShopMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                      
                      {/* Mobile Shop Submenu */}
                      {isShopMenuOpen && (
                        <div className="ml-8 mt-2 space-y-1">
                          {/* Category */}
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2 text-sm">Category</h4>
                            <div className="space-y-1">
                              {shopCategories.category.map((category) => (
                                <button
                                  key={category.name}
                                  onClick={() => {
                                    closeMobileMenu();
                                    navigate(category.href);
                                  }}
                                  className="block text-sm text-gray-600 hover:text-yellow-700 py-1 px-2 rounded w-full text-left"
                                >
                                  {category.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Type */}
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2 text-sm">Type</h4>
                            <div className="space-y-1">
                              {shopCategories.type.map((type) => (
                                <button
                                  key={type.name}
                                  onClick={() => {
                                    closeMobileMenu();
                                    navigate(type.href);
                                  }}
                                  className="block text-sm text-gray-600 hover:text-yellow-700 py-1 px-2 rounded w-full text-left"
                                >
                                  {type.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Flush/Season */}
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2 text-sm">Flush/Season</h4>
                            <div className="space-y-1">
                              {shopCategories.flush.map((flush) => (
                                <button
                                  key={flush.name}
                                  onClick={() => {
                                    closeMobileMenu();
                                    navigate(flush.href);
                                  }}
                                  className="block text-sm text-gray-600 hover:text-yellow-700 py-1 px-2 rounded w-full text-left"
                                >
                                  {flush.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Region */}
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2 text-sm">Region</h4>
                            <div className="space-y-1">
                              {shopCategories.region.map((region) => (
                                <button
                                  key={region.name}
                                  onClick={() => {
                                    closeMobileMenu();
                                    navigate(region.href);
                                  }}
                                  className="block text-sm text-gray-600 hover:text-yellow-700 py-1 px-2 rounded w-full text-left"
                                >
                                  {region.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Packaging */}
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2 text-sm">Packaging</h4>
                            <div className="space-y-1">
                              {shopCategories.packaging.map((packaging) => (
                                <button
                                  key={packaging.name}
                                  onClick={() => {
                                    closeMobileMenu();
                                    navigate(packaging.href);
                                  }}
                                  className="block text-sm text-gray-600 hover:text-yellow-700 py-1 px-2 rounded w-full text-left"
                                >
                                  {packaging.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Featured */}
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2 text-sm">Featured</h4>
                            <div className="space-y-1">
                              {shopCategories.featured.map((featured) => (
                                <button
                                  key={featured.name}
                                  onClick={() => {
                                    closeMobileMenu();
                                    navigate(featured.href);
                                  }}
                                  className="block text-sm text-gray-600 hover:text-yellow-700 py-1 px-2 rounded w-full text-left"
                                >
                                  {featured.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActiveRoute(item.href)
                        ? 'text-black bg-green-100 border-l-4 border-green-500 shadow-sm'
                        : 'text-yellow-700 hover:text-yellow-800 hover:bg-yellow-50'
                    }`}
                  >
                    <Icon size={20} className="text-green-600" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Cart Section */}
            <div className="px-4 py-4 border-t border-yellow-200">
              <Link to="/cart" onClick={closeMobileMenu}>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center space-x-2 bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  <ShoppingBag size={20} />
                  <span>Cart ({cartItemCount})</span>
                </Button>
              </Link>
            </div>

            {/* Profile Section */}
            <div className="px-4 py-4 border-t border-yellow-200">
              {user ? (
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center space-x-2 bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100" 
                    onClick={() => handleProfileMenu('/profile')}
                  >
                    <UserCircle size={20} />
                    <span>Profile</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center space-x-2 bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100" 
                    onClick={() => handleProfileMenu('/wishlist')}
                  >
                    <Heart size={20} />
                    <span>Wishlist</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center space-x-2 border-red-200 text-red-600 hover:bg-red-50" 
                    onClick={handleLogout}
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center space-x-2 bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100" 
                    onClick={() => handleProfileMenu('/login')}
                  >
                    <LogIn size={20} />
                    <span>Login</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center space-x-2 bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100" 
                    onClick={() => handleProfileMenu('/register')}
                  >
                    <User size={20} />
                    <span>Register</span>
                  </Button>
                </div>
              )}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-yellow-200 bg-green-100">
            <div className="text-center text-sm text-yellow-800">
              <p className="font-medium">Yellow Tea</p>
              <p className="text-xs opacity-75">Premium Indian Tea Collection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close shop menu */}
      {isShopMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={closeShopMenu}
        />
      )}
    </>
  );
}