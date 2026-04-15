import { Star, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useMemo } from "react";
import { useProducts } from '@/hooks/use-products';

const AutumnFlushSection = () => {
  const navigate = useNavigate();
  const { products, loading } = useProducts({ category: 'Full-Sized' });

  const autumnProducts = useMemo(() =>
    products.filter(product => product.category === 'Full-Sized'),
    [products]
  );

  const handleAddToCart = (slug: string) => {
    navigate(`/product/${slug}`);
  };

  return (
    <section className="py-12 lg:py-20 bg-gradient-to-br from-background to-yellow-50/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8 lg:mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground mb-2">Autumn Flush Teas</h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              From first flush Darjeeling to strong Assam CTC, here's full-bodied character and complexity of India's legendary teas.
            </p>
          </div>
          <Link to="/shop" className="hidden md:block">
            <Button variant="outline" className="text-amber-600 border-amber-600 hover:bg-amber-50">
              View all →
            </Button>
          </Link>
        </div>
        {/* Products Carousel */}
        <div className="relative">
          {loading ? (
            <div className="py-12 text-center text-amber-600 font-semibold">Loading autumn flush teas...</div>
          ) : autumnProducts.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No autumn flush teas found.</div>
          ) : (
            <Carousel className="w-full" opts={{ align: "start", loop: true }}>
              <CarouselContent className="-ml-2 md:-ml-4">
                {autumnProducts.map((product) => (
                  <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div className="group relative bg-white rounded-3xl  hover:shadow-2xl transition-all duration-500 overflow-hidden border border-amber-100 hover:border-amber-200 hover:-translate-y-2">
                      {/* Product Image with Enhanced Background */}
                      <div className="relative aspect-square  bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 overflow-hidden">
                        {/* Decorative Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-4 right-4 w-20 h-20 bg-yellow-300 rounded-full blur-xl"></div>
                          <div className="absolute bottom-4 left-4 w-16 h-16 bg-amber-300 rounded-full blur-lg"></div>
                        </div>
                        <img 
                          src={product.images?.[0] || '/placeholder.svg'} 
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 relative z-10 drop-shadow-lg"
                        />
                        {/* Enhanced Badge */}
                        {product.badges?.[0] && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border-0 border-white z-20">
                            {product.badges[0]}
                          </div>
                        )}
                        {/* Heart Icon for Wishlist */}
                        <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer hover:bg-white">
                          <Star className="w-4 h-4 text-amber-500" />
                        </div>
                      </div>
                      {/* Enhanced Product Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-sm lg:text-base text-gray-900 mb-1 line-clamp-2 group-hover:text-amber-700 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                          {product.subtitle}
                        </p>
                        {/* Enhanced Price Section */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-lg text-gray-900">₹{product.price}</span>
                          {/* No originalPrice in dynamic API; show offer or formattedPrice if available */}
                          {product.formattedPrice && product.formattedPrice !== `₹${product.price}` && (
                            <span className="text-xs text-gray-500 line-through bg-gray-100 px-1.5 py-0.5 rounded">{product.formattedPrice}</span>
                          )}
                          {product.offer && (
                            <span className="text-xs font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">{product.offer}</span>
                          )}
                        </div>
                        {/* Enhanced Rating */}
                        <div className="flex items-center gap-1.5 mb-3">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium text-gray-700">{product.rating}</span>
                          <span className="text-xs text-gray-500">({product.reviewCount})</span>
                        </div>
                        {/* Enhanced Add to Cart Button */}
                        <Button
                          onClick={() => handleAddToCart(product.slug)}
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2.5 text-xs rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                          Add to Cart
                        </Button>
                      </div>
                      {/* Hover Overlay Effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-amber-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {/* Custom Navigation Buttons */}
              <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-xl border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all duration-300" />
              <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-xl border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-all duration-300" />
            </Carousel>
          )}
        </div>
        {/* Enhanced View All Button */}
        <div className="text-center mt-8">
          <Link to="/shop">
            <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-3 px-8 text-sm rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              VIEW ALL PRODUCTS
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AutumnFlushSection;