import { Check, Star, Leaf, Coffee, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const PremiumTeaCollection = () => {
  const collections = [{
    id: "trial-packs",
    category: "Trial Packs",
    label: "Most Popular",
    price: "Starting ₹349",
    title: "Perfect for beginners",
    teaser: "Not sure which tea suits your palate? Try our best-selling trial packs first.",
    features: ["Buy 10 Get 10 Free", "Free Teacup", "Free Shipping"],
    cta: "Shop Trial Packs",
    icon: Star,
    bgImage: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop&crop=center",
    gradient: "from-amber-50 to-orange-50",
    badgeColor: "bg-amber-500"
  }, {
    id: "premium-black",
    category: "Premium Black Teas",
    label: "Premium Collection",
    price: "Starting ₹699",
    title: "Autumn flush collection",
    teaser: "From first flush Darjeeling to strong Assam CTC - experience authentic flavors.",
    features: ["4 Darjeeling Varieties", "Premium Quality", "Limited Edition"],
    cta: "Shop Premium Black Teas",
    icon: Coffee,
    bgImage: "https://images.unsplash.com/photo-1597318372855-0ab40d32cd64?w=400&h=300&fit=crop&crop=center",
    gradient: "from-amber-50 to-yellow-50",
    badgeColor: "bg-amber-600"
  }, {
    id: "masala-chai",
    category: "Masala Chai Blends",
    label: "Traditional Blends",
    price: "Starting ₹399",
    title: "Street-style authentic",
    teaser: "Relish authentic street-style masala Tea blends from across India.",
    features: ["Traditional Blends", "4 Regional Variants", "CTC & Whole Leaf"],
    cta: "Shop Masala Chai Blends",
    icon: Coffee,
    bgImage: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop&crop=center",
    gradient: "from-orange-50 to-red-50",
    badgeColor: "bg-orange-500"
  }, {
    id: "wellness-green",
    category: "Wellness Green Teas",
    label: "Health & Wellness",
    price: "Starting ₹549",
    title: "Health & wellness",
    teaser: "Discover the healing touch of nature with our premium green tea collection.",
    features: ["Kashmiri Kahwa", "Ashwagandha", "Rose Glow", "Organic"],
    cta: "Shop Wellness Green Teas",
    icon: Heart,
    bgImage: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=400&h=300&fit=crop&crop=center",
    gradient: "from-green-50 to-emerald-50",
    badgeColor: "bg-green-500"
  }];
  return <section className="py-12 lg:py-20 bg-gradient-to-br from-background to-amber-50/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-8 lg:mb-16 space-y-3 lg:space-y-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-foreground">Premium Tea Collection</h2>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-amber-600">
            Explore Our Tea Collection
          </h3>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From refreshing trial packs to premium wellness blends - find your perfect cup
          </p>
        </div>

        {/* Collection Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {collections.map(collection => <div key={collection.id} className={`group relative bg-gradient-to-br ${collection.gradient} rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/50`}>
              {/* Background Image */}
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <img src={collection.bgImage} alt={`${collection.category} background`} className="w-full h-full object-cover" />
              </div>

              {/* Card Content */}
              <div className="relative p-4 lg:p-6 h-full flex flex-col">
                
                {/* Header */}
                <div className="flex items-start justify-between mb-3 lg:mb-4">
                  <div className="space-y-1">
                    <div className={`inline-flex items-center gap-1.5 ${collection.badgeColor} text-white text-xs font-medium px-2 py-1 rounded-full`}>
                      <collection.icon className="w-3 h-3" aria-hidden="true" />
                      {collection.label}
                    </div>
                    <div className="text-xs lg:text-sm text-muted-foreground font-medium">
                      {collection.price}
                    </div>
                  </div>
                </div>

                {/* Title & Teaser */}
                <div className="mb-4 lg:mb-6 flex-1">
                  <h3 className="text-base lg:text-lg xl:text-xl font-bold text-foreground mb-2 group-hover:text-amber-700 transition-colors">
                    {collection.title}
                  </h3>
                  <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">
                    {collection.teaser}
                  </p>
                </div>

                {/* Features */}
                <div className="mb-4 lg:mb-6 space-y-1.5 lg:space-y-2">
                  {collection.features.map((feature, index) => <div key={index} className="flex items-center gap-2">
                      <Check className="w-3 h-3 lg:w-4 lg:h-4 text-green-600 flex-shrink-0" aria-hidden="true" />
                      <span className="text-xs lg:text-sm text-foreground font-medium">
                        {feature}
                      </span>
                    </div>)}
                </div>

                {/* CTA Button */}
                <Link to="/shop" className="w-full">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 lg:py-3 text-xs lg:text-sm rounded-xl group-hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl min-h-[44px]">
                    {collection.cta}
                  </Button>
                </Link>
              </div>
            </div>)}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8 lg:mt-16">
          <p className="text-sm lg:text-base text-muted-foreground mb-4">
            Can&apos;t decide? Browse our complete collection
          </p>
          <Link to="/shop">
            <Button variant="outline" size="lg" className="border-2 border-amber-500 text-amber-600 hover:bg-amber-50 font-semibold px-6 lg:px-8 py-3 lg:py-4 rounded-full transition-all duration-300 hover:scale-105">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>;
};
export default PremiumTeaCollection;