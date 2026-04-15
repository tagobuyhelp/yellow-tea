
import { Badge } from "@/components/ui/badge";
import { Leaf, Award, Heart, Globe } from "lucide-react";

const WelcomeBlock = () => {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-white to-amber-50/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Background Image with overlay */}
          <div className="absolute inset-0 bg-[url('/uploads/beautiful-strawberry-garden-sunrise-doi-ang-khang-chiang-mai-thailand.jpg')] bg-cover bg-center rounded-2xl md:rounded-3xl opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/40 via-transparent to-green-50/40 rounded-2xl md:rounded-3xl"></div>
          
          {/* Content */}
          <div className="relative z-10 text-center py-12 md:py-20 px-6 md:px-12">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm font-medium hover:bg-green-200 transition-colors duration-300">
                  <Leaf className="w-4 h-4 mr-2" />
                  From India's Tea Gardens
                </Badge>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-800 mb-8 md:mb-12 leading-tight">
                Experience{" "}
                <span className="text-amber-700 italic">India's timeless</span>
                <br className="hidden sm:block" />
                tea traditions
              </h2>
              
              <div className="w-16 md:w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6 md:mb-8"></div>
              
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 leading-relaxed font-light mb-8 md:mb-12">
                From the misty hills of Darjeeling to your cup, every leaf tells a story of passion, 
                tradition, and the dedication of generations of tea artisans.
              </p>
              
              {/* Impact Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center">
                  <Award className="w-6 h-6 md:w-8 md:h-8 text-amber-600 mx-auto mb-2" />
                  <div className="text-xl md:text-3xl font-bold text-amber-600">2500+</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Farmers Supported</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center">
                  <Leaf className="w-6 h-6 md:w-8 md:h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-xl md:text-3xl font-bold text-green-600">100%</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Whole Leaf</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center">
                  <Globe className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-xl md:text-3xl font-bold text-blue-600">8-10</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Days Delivery</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center">
                  <Heart className="w-6 h-6 md:w-8 md:h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-xl md:text-3xl font-bold text-red-500">50K+</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Happy Customers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeBlock;
