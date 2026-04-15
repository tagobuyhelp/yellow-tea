import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Shield, Truck, Leaf, Play } from "lucide-react";
import { productsService, type Product } from "@/services/products";

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Fetch featured products from API
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productsService.getProducts();
        if (response.success && Array.isArray(response.data.products)) {
          // Get first 8 products or filter by popularity if available
          const products = response.data.products.slice(0, 8);
          setFeaturedProducts(products);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Auto-scroll for desktop featured product
  useEffect(() => {
    if (featuredProducts.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  // Auto-scroll for mobile product grid
  useEffect(() => {
    if (featuredProducts.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentMobileIndex((prev) => (prev + 1) % Math.max(1, featuredProducts.length - 3));
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  // Get current products for display
  const getCurrentMobileProducts = () => {
    if (featuredProducts.length <= 4) return featuredProducts.slice(0, 4);
    
    const startIndex = currentMobileIndex;
    const endIndex = Math.min(startIndex + 4, featuredProducts.length);
    let products = featuredProducts.slice(startIndex, endIndex);
    
    // If we don't have enough products, wrap around
    if (products.length < 4) {
      products = [...products, ...featuredProducts.slice(0, 4 - products.length)];
    }
    
    return products.slice(0, 4);
  };

  return <section className="relative w-full  min-h-[80vh] md:min-h-[75vh] lg:min-h-[85vh] flex items-center overflow-hidden">{/* Fixed width constraints and overflow */}
    {/* Background Image */}
    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100" style={{
      backgroundImage: "url('/uploads/rural-farm-scene-terraced-tea-crop-growth-mountain-backdrop-generated-by-ai.jpg')"
    }}>
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/75"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-green-900/20"></div>
    </div>

    {/* Additional Background Elements - constrained to viewport */}
    <div className="absolute inset-0 opacity-10 overflow-hidden">
      <div className="absolute top-20 right-5 sm:right-10 lg:right-20 w-24 h-24 sm:w-32 sm:h-32 lg:w-64 lg:h-64 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-5 sm:left-10 lg:left-20 w-32 h-32 sm:w-48 sm:h-48 lg:w-96 lg:h-96 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full blur-3xl"></div>
    </div>

    {/* Floating Tea Elements - constrained positioning */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(4)].map((_, i) => <div key={i} className="absolute opacity-20 animate-bounce hidden sm:block" style={{
        left: `${20 + i * 15}%`,
        top: `${25 + i % 2 * 30}%`,
        animationDelay: `${i * 1}s`,
        animationDuration: '3s'
      }}>
        <Leaf className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-green-600 transform rotate-12" />
      </div>)}
    </div>

    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10 overflow-hidden py-[40px]">{/* Added overflow-hidden to prevent elements from moving outwards */}
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 items-center min-h-[55vh] md:min-h-[70vh] lg:min-h-[80vh]">{/* //REMOVE:"&& Reduced padding and gaps for better mobile width usage */}

        {/* Left Content */}
        <div className={`w-full max-w-2xl mx-auto lg:mx-0 text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>{/* //REMOVE:"&& Ensured proper width constraints */}

          {/* Trust Badge */}
          <div className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-white/30 rounded-full px-2.5 py-1.5 mb-3 md:mb-4 lg:mb-6 shadow-lg">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 fill-current" />
            <span className="text-xs font-medium text-gray-800">Trusted by 50K+ Tea Lovers</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 fill-current" />)}
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-white mb-2 sm:mb-3 md:mb-4 lg:mb-6 leading-tight px-2 drop-shadow-2xl">
          Straight from Garden to Cup
          </h1>

          {/* Subheadline */}
          <div className="text-sm sm:text-sm md:text-sm lg:text-sm text-white/90 mb-3 sm:mb-4 md:mb-6 lg:mb-8 font-light leading-relaxed px-2 drop-shadow-lg">
            <p className="mb-1 sm:mb-2">Delivered in 8–10 Days Worldwide</p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-2.5 mb-4 sm:mb-6 md:mb-8 lg:mb-12 px-2">
            <Link to="/shop" className="w-full">
              <Button size="lg" className="group bg-amber-600 hover:bg-amber-700 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-52 md:w-full min-h-[44px] md:min-h-[56px]">
                Shop Premium Teas
                <ArrowRight className="ml-0 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8 px-5">
            <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/30 shadow-lg">
              <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                <span className="font-bold text-gray-800 text-xs sm:text-sm md:text-base">100%</span>
              </div>
              <span className="text-[8px] sm:text-xs text-gray-700">Organic Certified</span>
            </div>
            <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/30 shadow-lg">
              <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                <span className="font-bold text-gray-800 text-xs sm:text-sm md:text-base">8-10</span>
              </div>
              <span className="text-[8px] sm:text-xs text-gray-700">Days Delivery</span>
            </div>
            <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/30 shadow-lg px-0">
              <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
                <Leaf className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                <span className="font-bold text-gray-800 text-xs sm:text-sm md:text-base">2500+</span>
              </div>
              <span className="text-[8px] sm:text-xs text-gray-700">Farmers Supported</span>
            </div>
          </div>

          {/* Product Thumbnails Preview - Mobile with Auto-scroll */}
          <div className="lg:hidden px-1 max-w-full">
            <p className="text-xs sm:text-sm font-semibold text-white/90 mb-2 sm:mb-3 text-center drop-shadow-lg">Popular Choices:</p>

            {/* Auto-scrolling grid for mobile */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 max-w-full">
              {loading ? (
                // Loading skeleton
                [...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg p-1.5 sm:p-2 shadow-md border border-gray-100 w-full animate-pulse">
                    <div className="bg-gray-200 w-full h-10 sm:h-12 rounded mb-1"></div>
                    <div className="bg-gray-200 h-2 rounded mb-1"></div>
                    <div className="bg-gray-200 h-2 rounded w-3/4"></div>
                  </div>
                ))
              ) : (
                getCurrentMobileProducts().map((product, index) => (
                  <Link 
                    key={`${product.id || product.slug}-${index}-${currentMobileIndex}`} 
                    to={`/product/${product.slug || product.id}`} 
                    className="group bg-white rounded-lg p-1.5 sm:p-2 shadow-md hover:shadow-xl transition-all duration-500 border border-gray-100 w-full transform hover:scale-105"
                  >
                    <div className="relative mb-1">
                      <img 
                        src={product.images?.[0] || '/placeholder.svg'} 
                        alt={product.name} 
                        className="w-full h-10 sm:h-12 object-cover rounded transition-transform duration-300 group-hover:scale-110" 
                      />
                      <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white text-[7px] px-0.5 py-0.5 rounded-full font-medium">
                        {product.badges?.[0]?.slice(0, 2) || 'Tea'}
                      </span>
                    </div>
                    <h3 className="text-[8px] sm:text-[9px] font-medium text-gray-800 text-center mb-0.5 leading-tight line-clamp-1">
                      {product.name.split(' ').slice(0, 2).join(' ')}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] font-bold text-amber-600 text-center">
                      ₹{product.price}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Content - Desktop Product Showcase with Auto-scroll */}
        <div className={`hidden lg:block transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
          <div className="relative w-full max-w-lg ml-auto">
            {/* Main Featured Product - Auto-scrolling */}
            {loading ? (
              // Loading skeleton for main product
              <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 animate-pulse">
                <div className="bg-gray-200 w-full h-80 rounded-2xl mb-4"></div>
                <div className="bg-gray-200 h-6 rounded mb-2"></div>
                <div className="bg-gray-200 h-8 rounded w-1/3"></div>
              </div>
            ) : featuredProducts.length > 0 ? (
              <Link to={`/product/${featuredProducts[currentProductIndex].slug || featuredProducts[currentProductIndex].id}`} className="group">
                <div className="relative bg-white rounded-3xl p-6 shadow-2xl hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                  <img 
                    alt={featuredProducts[currentProductIndex].name} 
                    className="w-full h-80 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300" 
                    src={featuredProducts[currentProductIndex].images?.[0] || '/placeholder.svg'} 
                  />
                  <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {featuredProducts[currentProductIndex].badges?.[0] || 'Featured'}
                  </div>
                  <h3 className="text-xl font-medium text-gray-800 mb-1 line-clamp-2 pt-3">
                    {featuredProducts[currentProductIndex].name}
                  </h3>
                  <p className="text-xl font-bold text-amber-600">
                    ₹{featuredProducts[currentProductIndex].price}
                  </p>
                </div>
              </Link>
            ) : null}

            {/* Product Thumbnails - Auto-scrolling */}
            <div className="mt-6">
              <p className="text-lg font-semibold mb-4 text-slate-50">Popular Choices:</p>
              <div className="grid grid-cols-3 gap-3">
                {loading ? (
                  // Loading skeleton
                  [...Array(3)].map((_, index) => (
                    <div key={index} className="bg-white rounded-2xl p-3 shadow-md border border-gray-100 animate-pulse">
                      <div className="bg-gray-200 w-full h-24 rounded-xl mb-3"></div>
                      <div className="bg-gray-200 h-3 rounded mb-1"></div>
                      <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                    </div>
                  ))
                ) : (
                  // Auto-scrolling thumbnails - show next 3 products after current featured
                  featuredProducts
                    .slice(currentProductIndex + 1)
                    .concat(featuredProducts.slice(0, Math.max(0, 3 - (featuredProducts.length - currentProductIndex - 1))))
                    .slice(0, 3)
                    .map((product, index) => (
                      <Link 
                        key={`${product.id || product.slug}-${index}-${currentProductIndex}`} 
                        to={`/product/${product.slug || product.id}`} 
                        className="group bg-white rounded-2xl p-3 shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100" 
                        title={`Shop ${product.name}`}
                      >
                        <div className="relative mb-3">
                          <img 
                            src={product.images?.[0] || '/placeholder.svg'} 
                            alt={product.name} 
                            className="w-full h-24 object-cover rounded-xl group-hover:scale-110 transition-transform duration-300" 
                          />
                          <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {product.badges?.[0] || 'Tea'}
                          </span>
                        </div>
                        <h3 className="text-xs font-medium text-gray-800 mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm font-bold text-amber-600">
                          ₹{product.price}
                        </p>
                      </Link>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>;
};
export default Hero;