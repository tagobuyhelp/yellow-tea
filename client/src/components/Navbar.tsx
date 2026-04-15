
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, User, Menu, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCart();


  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/uploads/site_logo.jpg" 
                alt="Yellow Tea Logo" 
                className="h-10 w-auto object-contain"
              />
              <h1 className="text-2xl font-bold text-amber-600 hidden sm:block">YELLOW TEA</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/shop" className="text-gray-700 hover:text-amber-600 px-3 py-2 text-sm font-medium transition-colors">
                Shop Tea
              </Link>
              <a href="#" className="text-gray-700 hover:text-amber-600 px-3 py-2 text-sm font-medium transition-colors">
                Trial Packs
              </a>
              <a href="#" className="text-gray-700 hover:text-amber-600 px-3 py-2 text-sm font-medium transition-colors">
                Gifts
              </a>
              <a href="#" className="text-gray-700 hover:text-amber-600 px-3 py-2 text-sm font-medium transition-colors">
                Learn
              </a>
              <a href="#" className="text-gray-700 hover:text-amber-600 px-3 py-2 text-sm font-medium transition-colors">
                Our Story
              </a>
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <Link to="/search">
              <Button variant="ghost" size="sm">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" size="sm">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-6 border-b">
                      <div className="flex items-center space-x-3">
                        <img 
                          src="/uploads/site_logo.jpg" 
                          alt="Yellow Tea Logo" 
                          className="h-8 w-auto object-contain"
                        />
                        <h2 className="text-2xl font-bold text-amber-600">YELLOW TEA</h2>
                      </div>
                    </div>
                    <div className="flex-1 py-6">
                      <nav className="space-y-2 px-6">
                        <Link
                          to="/shop"
                          className="flex items-center px-4 py-3 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Shop Tea
                        </Link>
                        <a
                          href="#"
                          className="flex items-center px-4 py-3 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Trial Packs
                        </a>
                        <a
                          href="#"
                          className="flex items-center px-4 py-3 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Gifts
                        </a>
                        <a
                          href="#"
                          className="flex items-center px-4 py-3 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Learn
                        </a>
                        <a
                          href="#"
                          className="flex items-center px-4 py-3 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Our Story
                        </a>
                      </nav>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
