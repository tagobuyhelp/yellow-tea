import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, Award, Heart, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const WelcomeBlock = () => {
  return (
    <section className="py-16 lg:py-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/uploads/india-fog-tea-cool-tea-leaves.jpg')" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/35" aria-hidden="true" />

          <div className="relative z-10 px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
              <div className="text-white">
                <div className="animate-fade-in" style={{ animationDelay: "40ms" }}>
                  <Badge className="bg-white/15 text-white border border-white/25 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                    <Leaf className="w-4 h-4 mr-2 text-[#F4B400]" />
                    From India's Tea Gardens
                  </Badge>
                </div>

                <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-heading font-semibold leading-tight animate-fade-in" style={{ animationDelay: "120ms" }}>
                  From India&apos;s Finest Tea Gardens to Your Cup
                </h2>

                <p className="mt-4 text-base sm:text-lg text-white/90 max-w-xl leading-relaxed animate-fade-in" style={{ animationDelay: "180ms" }}>
                  Fresh, whole leaf teas sourced directly from trusted estates.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: "240ms" }}>
                  <Link to="/shop" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-[#F4B400] hover:bg-[#FFD54F] text-[#111111] font-semibold min-h-[46px] px-6 rounded-xl transition-all duration-200 hover:translate-y-[-1px]">
                      Explore Teas
                    </Button>
                  </Link>
                  <Link to="/about" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto border-white/40 text-white bg-white/10 hover:bg-white/20 hover:text-white min-h-[46px] px-6 rounded-xl transition-all duration-200">
                      Our Story
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 lg:gap-5">
                <div className="bg-white/88 backdrop-blur-sm rounded-xl p-4 lg:p-5 text-center  bg-black/40 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <Award className="w-6 h-6 lg:w-7 lg:h-7 text-[#F4B400] mx-auto mb-2" />
                  <div className="text-xl lg:text-2xl font-bold text-white">2500+</div>
                  <div className="text-xs lg:text-sm text-[#6B7280] font-medium mt-1">Farmers Supported</div>
                </div>
                <div className="bg-white/88 backdrop-blur-sm rounded-xl p-4 lg:p-5 text-center  bg-black/40 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <Leaf className="w-6 h-6 lg:w-7 lg:h-7 text-[#2F6B3A] mx-auto mb-2" />
                  <div className="text-xl lg:text-2xl font-bold text-white">100%</div>
                  <div className="text-xs lg:text-sm text-[#6B7280] font-medium mt-1">Whole Leaf</div>
                </div>
                <div className="bg-white/88 backdrop-blur-sm rounded-xl p-4 lg:p-5 text-center  bg-black/40 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <Globe className="w-6 h-6 lg:w-7 lg:h-7 text-[#2F6B3A] mx-auto mb-2" />
                  <div className="text-xl lg:text-2xl font-bold text-white">8-10</div>
                  <div className="text-xs lg:text-sm text-[#6B7280] font-medium mt-1">Days Delivery</div>
                </div>
                <div className="bg-white/88 backdrop-blur-sm rounded-xl p-4 lg:p-5 text-center  bg-black/40 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <Heart className="w-6 h-6 lg:w-7 lg:h-7 text-[#F4B400] mx-auto mb-2" />
                  <div className="text-xl lg:text-2xl font-bold text-white">50K+</div>
                  <div className="text-xs lg:text-sm text-[#6B7280] font-medium mt-1">Happy Customers</div>
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
