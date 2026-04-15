
import { Star } from "lucide-react";

const PressMentions = () => {
  const mentions = [
    { name: "The New York Times", logo: "NYT", rating: "★★★★★" },
    { name: "Forbes", logo: "FORBES", rating: "★★★★★" },
    { name: "CNN", logo: "CNN", rating: "★★★★☆" },
    { name: "Women's Health", logo: "WH", rating: "★★★★★" },
    { name: "Inc.", logo: "INC", rating: "★★★★☆" }
  ];

  return (
    <section className="py-8 md:py-16 bg-white border-y border-gray-100">
      <div className="max-w-6xl mx-auto container-mobile">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-amber-500 fill-current" />
            <span className="text-responsive-xs font-medium text-gray-500 uppercase tracking-wider">
              As Featured In
            </span>
            <Star className="w-4 h-4 text-amber-500 fill-current" />
          </div>
          <p className="text-responsive-sm text-gray-600">
            Trusted by leading publications worldwide
          </p>
        </div>
        
        {/* Press Logos */}
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 lg:gap-16">
          {mentions.map((mention, index) => (
            <div 
              key={index}
              className="group flex flex-col items-center justify-center min-h-[80px] px-4 py-3 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 cursor-pointer"
            >
              {/* Logo */}
              <span className="font-display font-bold text-gray-600 tracking-tight text-lg md:text-xl lg:text-2xl mb-1 group-hover:text-gray-800 transition-colors">
                {mention.logo}
              </span>
              
              {/* Rating */}
              <div className="text-amber-500 text-xs md:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {mention.rating}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-8 md:mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 bg-gray-50 rounded-2xl px-6 py-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-current" />
              <span className="font-display font-semibold text-gray-800">4.9/5</span>
              <span className="text-gray-600 text-responsive-sm">Average Rating</span>
            </div>
            
            <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
            
            <div className="text-center sm:text-left">
              <span className="font-display font-semibold text-gray-800">50K+</span>
              <span className="text-gray-600 text-responsive-sm ml-2">Verified Reviews</span>
            </div>
            
            <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
            
            <div className="text-center sm:text-left">
              <span className="font-display font-semibold text-gray-800">150+</span>
              <span className="text-gray-600 text-responsive-sm ml-2">Countries Served</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PressMentions;
