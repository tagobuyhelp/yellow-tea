import { Leaf, Truck, Heart, Shield, Clock, Handshake } from "lucide-react";

const WhyChooseYellowTea = () => {
  const benefits = [
    {
      icon: Leaf,
      title: "Garden Fresh Guarantee",
      description: "From tea gardens to your cup in just 10 days, ensuring maximum freshness and flavor."
    },
    {
      icon: Truck,
      title: "Swift Nationwide Delivery",
      description: "Free delivery across India with eco-friendly packaging that preserves tea quality."
    },
    {
      icon: Heart,
      title: "Farmer Impact Program",
      description: "Every purchase supports education for farmers' children and sustainable farming practices."
    },
    {
      icon: Shield,
      title: "100% Authentic Sourcing",
      description: "Direct partnerships with certified tea estates ensure authenticity and quality standards."
    },
    {
      icon: Clock,
      title: "Vacuum-Sealed Freshness",
      description: "Advanced packaging technology locks in flavor and extends shelf life naturally."
    },
    {
      icon: Handshake,
      title: "Ethical Trade Practices",
      description: "Fair wages for farmers and sustainable harvesting methods that protect the environment."
    }
  ];

  const stats = [
    {
      number: "50K+",
      label: "Happy Tea Lovers",
      subLabel: "Across India"
    },
    {
      number: "10",
      label: "Days Fresh",
      subLabel: "Garden to Cup"
    },
    {
      number: "2,500+",
      label: "Farmers Supported",
      subLabel: "Fair Trade"
    },
    {
      number: "100%",
      label: "Organic Certified",
      subLabel: "Premium Quality"
    }
  ];

  return (
    <section className="py-12 lg:py-20 bg-gradient-to-br from-background via-background to-amber-50/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          
          {/* Left Column - Main Content */}
          <div className="space-y-6 lg:space-y-8">
            {/* Section Header */}
            <div className="space-y-3 lg:space-y-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-display font-bold text-foreground leading-tight">
                Why Choose{" "}
                <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                  Yellow Tea?
                </span>
              </h2>
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed max-w-xl">
                Experience the perfect blend of tradition, quality, and ethical sourcing that makes every cup a journey of flavor and conscience.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid gap-4 lg:gap-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl hover:bg-white/50 transition-all duration-300 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <benefit.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm lg:text-base font-semibold text-foreground mb-1 group-hover:text-amber-700 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-xs lg:text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-xl border border-white/50">
              <h3 className="text-lg lg:text-xl font-display font-semibold text-foreground mb-6 lg:mb-8 text-center">
                Our Impact in Numbers
              </h3>
              
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                {stats.map((stat, index) => (
                  <div 
                    key={index}
                    className="text-center p-3 lg:p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 hover:from-amber-100 hover:to-amber-200/50 transition-all duration-300 group hover:scale-105"
                  >
                    <div className="space-y-1 lg:space-y-2">
                      <div className="text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent group-hover:from-amber-700 group-hover:to-amber-800 transition-all duration-300">
                        {stat.number}
                      </div>
                      <div className="text-xs lg:text-sm font-semibold text-foreground">
                        {stat.label}
                      </div>
                      <div className="text-[10px] lg:text-xs text-muted-foreground">
                        {stat.subLabel}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional CTA in Stats Card */}
              <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-amber-200/50">
                <p className="text-xs lg:text-sm text-center text-muted-foreground">
                  Join thousands of tea lovers who've made the switch to{" "}
                  <span className="font-semibold text-amber-600">authentic, fresh tea</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseYellowTea;