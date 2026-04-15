
import { Leaf, Shield, Globe, Heart } from "lucide-react";

const WhyYellowTea = () => {
  const features = [
    {
      icon: Leaf,
      title: "Freshness You Can Taste",
      description: "Vacuum-sealed at source and delivered within days of harvest",
      color: "text-green-600 bg-green-100"
    },
    {
      icon: Shield,
      title: "100% Pure, No Dust, No Fillers",
      description: "Only whole leaf teas, carefully selected and processed",
      color: "text-blue-600 bg-blue-100"
    },
    {
      icon: Globe,
      title: "Delivered Worldwide in 10 Days",
      description: "Express delivery ensures maximum freshness globally",
      color: "text-amber-600 bg-amber-100"
    },
    {
      icon: Heart,
      title: "Ethically Sourced & Transparent",
      description: "Direct trade relationships supporting tea garden communities",
      color: "text-red-600 bg-red-100"
    }
  ];

  return (
    <section className="spacing-mobile bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-6xl mx-auto container-mobile">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-responsive-2xl font-display font-bold text-gray-800 mb-3 md:mb-4">
            Why Choose Yellow Tea?
          </h2>
          <p className="text-responsive-base text-gray-600 max-w-2xl mx-auto">
            Discover what makes our tea different from garden to cup
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group text-center p-4 md:p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full mb-4 md:mb-6 transition-all duration-300 group-hover:scale-110 ${feature.color}`}>
                <feature.icon className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              
              {/* Content */}
              <h3 className="text-responsive-lg font-display font-semibold text-gray-800 mb-2 md:mb-4 leading-tight">
                {feature.title}
              </h3>
              <p className="text-responsive-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 md:p-8">
          <div className="text-center">
            <div className="text-xl md:text-3xl font-bold text-green-600 font-display">2500+</div>
            <div className="text-responsive-xs text-gray-600 font-medium">Farmers Supported</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-3xl font-bold text-amber-600 font-display">100%</div>
            <div className="text-responsive-xs text-gray-600 font-medium">Whole Leaf</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-3xl font-bold text-blue-600 font-display">8-10</div>
            <div className="text-responsive-xs text-gray-600 font-medium">Days Delivery</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-3xl font-bold text-red-500 font-display">50K+</div>
            <div className="text-responsive-xs text-gray-600 font-medium">Happy Customers</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyYellowTea;
