import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Shield, Truck, Leaf } from "lucide-react";
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

  return (
    <section className="relative w-full min-h-[62vh] md:min-h-[58vh] lg:min-h-[66vh] flex items-center overflow-hidden bg-gradient-to-br from-[#FFF8E6] via-white to-[#FFF8E6]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: "url('/uploads/rural-farm-scene-terraced-tea-crop-growth-mountain-backdrop-generated-by-ai.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8E6]/90 via-white/90 to-[#FFF8E6]/88" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 h-72 w-72 bg-[#F4B400]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 bg-[#2F6B3A]/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8 lg:py-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className={`max-w-2xl mx-auto lg:mx-0 text-center lg:text-left transition-all duration-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
            <div className="inline-flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-full px-4 py-2 mb-6 shadow-sm">
              <Star className="w-4 h-4 text-[#F4B400] fill-current" />
              <span className="text-sm font-medium text-[#111111]">Trusted by 10,000+ tea lovers</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-[56px] font-semibold leading-tight text-[#111111] mb-4">
              Premium Indian Tea, Fresh from Garden to Cup
            </h1>

            <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed mb-3">
              Handpicked whole leaf teas delivered fresh in just days.
            </p>
            <p className="text-sm sm:text-base text-[#6B7280] mb-8">
              100% natural | No additives | Direct from tea estates
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-8">
              <Link to="/shop" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto min-h-[48px] px-7 bg-[#F4B400] hover:bg-[#FFD54F] text-[#111111] font-semibold rounded-xl transition-all duration-200 hover:translate-y-[-1px]"
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/shop" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto min-h-[48px] px-7 border-[#E5E7EB] text-[#111111] hover:bg-[#FFF8E6] rounded-xl transition-all duration-200"
                >
                  Explore Collection
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 text-left shadow-sm">
                <div className="flex items-center gap-2 text-[#111111] font-medium text-sm">
                  <Star className="h-4 w-4 text-[#F4B400]" />
                  Trusted Quality
                </div>
                <p className="text-xs text-[#6B7280] mt-1">Loved by tea enthusiasts across India.</p>
              </div>
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 text-left shadow-sm">
                <div className="flex items-center gap-2 text-[#111111] font-medium text-sm">
                  <Truck className="h-4 w-4 text-[#2F6B3A]" />
                  Fast Delivery
                </div>
                <p className="text-xs text-[#6B7280] mt-1">Quick shipping with careful packaging.</p>
              </div>
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 text-left shadow-sm">
                <div className="flex items-center gap-2 text-[#111111] font-medium text-sm">
                  <Leaf className="h-4 w-4 text-[#2F6B3A]" />
                  100% Natural
                </div>
                <p className="text-xs text-[#6B7280] mt-1">Whole leaf tea, no additives or fillers.</p>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
            <div className="relative w-full max-w-xl mx-auto">
              {loading ? (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB] animate-pulse">
                  <div className="bg-gray-200 w-full h-72 rounded-xl mb-4" />
                  <div className="bg-gray-200 h-5 rounded mb-2" />
                  <div className="bg-gray-200 h-6 rounded w-1/3" />
                </div>
              ) : featuredProducts.length > 0 ? (
                <Link to={`/product/${featuredProducts[currentProductIndex].slug || featuredProducts[currentProductIndex].id}`} className="group block">
                  <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-[#E5E7EB]">
                    <img
                      alt={featuredProducts[currentProductIndex].name}
                      className="w-full h-72 object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                      src={featuredProducts[currentProductIndex].images?.[0] || '/placeholder.svg'}
                      loading="eager"
                      decoding="async"
                    />
                    <div className="pt-4">
                      <div className="inline-flex items-center rounded-full bg-[#FFF8E6] text-[#111111] text-xs font-medium px-2.5 py-1 border border-[#E5E7EB]">
                        {featuredProducts[currentProductIndex].badges?.[0] || 'Featured'}
                      </div>
                      <h3 className="text-xl font-heading font-medium text-[#111111] mt-3 line-clamp-2">
                        {featuredProducts[currentProductIndex].name}
                      </h3>
                      <p className="text-xl font-semibold text-[#2F6B3A] mt-1">
                        ₹{featuredProducts[currentProductIndex].price}
                      </p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB] text-center">
                  <p className="text-sm text-[#6B7280]">Featured teas will appear here shortly.</p>
                </div>
              )}

              <div className="mt-4 grid grid-cols-3 gap-3">
                {loading
                  ? [...Array(3)].map((_, index) => (
                      <div key={index} className="bg-white rounded-xl p-2.5 shadow-sm border border-[#E5E7EB] animate-pulse">
                        <div className="bg-gray-200 w-full h-20 rounded-lg mb-2" />
                        <div className="bg-gray-200 h-3 rounded mb-1" />
                        <div className="bg-gray-200 h-3 rounded w-2/3" />
                      </div>
                    ))
                  : featuredProducts
                      .slice(currentProductIndex + 1)
                      .concat(featuredProducts.slice(0, Math.max(0, 3 - (featuredProducts.length - currentProductIndex - 1))))
                      .slice(0, 3)
                      .map((product, index) => (
                        <Link
                          key={`${product.id || product.slug}-${index}-${currentProductIndex}`}
                          to={`/product/${product.slug || product.id}`}
                          className="group bg-white rounded-xl p-2.5 shadow-sm hover:shadow-md transition-all duration-200 border border-[#E5E7EB]"
                          title={`Shop ${product.name}`}
                        >
                          <img
                            src={product.images?.[0] || '/placeholder.svg'}
                            alt={product.name}
                            className="w-full h-20 object-cover rounded-lg transition-transform duration-200 group-hover:scale-[1.03]"
                            loading="lazy"
                            decoding="async"
                          />
                          <h3 className="text-xs font-medium text-[#111111] mt-2 line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                      ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Hero;
