
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, Gift, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

const ProductCategories = () => {
  const categories = [
    {
      title: "Trial Packs",
      subtitle: "Perfect for beginners",
      description: "Not sure which tea suits your palate? Try our best-selling trial packs first.",
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?ixlib=rb-4.0.3",
      offers: ["Buy 10 Get 10 Free", "Free Teacup", "Free Shipping"],
      price: "Starting ₹349",
      popular: true,
      gradient: "from-orange-400 to-red-500"
    },
    {
      title: "Premium Black Teas",
      subtitle: "Autumn flush collection",
      description: "From first flush Darjeeling to strong Assam CTC - experience authentic flavors.",
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?ixlib=rb-4.0.3",
      offers: ["4 Darjeeling Varieties", "Premium Quality", "Limited Edition"],
      price: "Starting ₹699",
      popular: false,
      gradient: "from-amber-400 to-orange-500"
    },
    {
      title: "Masala Chai Blends",
      subtitle: "Street-style authentic",
      description: "Relish authentic street-style masala Tea blends from across India.",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3",
      offers: ["Traditional Blends", "4 Regional Variants", "CTC & Whole Leaf"],
      price: "Starting ₹399",
      popular: false,
      gradient: "from-red-400 to-pink-500"
    },
    {
      title: "Wellness Green Teas",
      subtitle: "Health & wellness",
      description: "Discover the healing touch of nature with our premium green tea collection.",
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-4.0.3",
      offers: ["Kashmiri Kahwa", "Ashwagandha", "Rose Glow", "Organic"],
      price: "Starting ₹549",
      popular: false,
      gradient: "from-green-400 to-emerald-500"
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full mb-4">
            <Leaf className="w-4 h-4" />
            <span className="text-sm font-medium">Premium Tea Collection</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Explore Our Tea Collection
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            From refreshing trial packs to premium wellness blends - find your perfect cup
          </p>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {categories.map((category, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-2xl md:rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
            >
              {/* Popular Badge */}
              {category.popular && (
                <div className="absolute top-4 left-4 z-20">
                  <Badge className="bg-red-500 text-white px-3 py-1">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Image Section */}
              <div className="relative overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-48 md:h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                
                {/* Price Badge */}
                <div className="absolute bottom-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-gray-800 font-semibold text-sm">{category.price}</span>
                  </div>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-6 md:p-8">
                <div className="mb-4">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
                    {category.title}
                  </h3>
                  <p className="text-amber-600 font-medium text-sm">{category.subtitle}</p>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed text-sm md:text-base">
                  {category.description}
                </p>
                
                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {category.offers.map((offer, offerIndex) => (
                    <Badge 
                      key={offerIndex}
                      variant="secondary"
                      className="text-xs bg-gray-100 text-gray-700 hover:bg-amber-100 hover:text-amber-800 transition-colors"
                    >
                      {offer}
                    </Badge>
                  ))}
                </div>
                
                {/* CTA Button */}
                <Link to="/shop">
                  <Button 
                    className="w-full group-hover:bg-amber-600 group-hover:text-white transition-all duration-300 bg-gray-900 text-white hover:bg-amber-600"
                    size="lg"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Shop {category.title}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 md:mt-16">
          <Link to="/shop">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-full">
              View All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
