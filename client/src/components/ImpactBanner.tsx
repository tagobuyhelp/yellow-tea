
import { Users, Recycle, MapPin, Award, Leaf } from "lucide-react";

const ImpactBanner = () => {
  const impacts = [
    {
      icon: Users,
      title: "1% to Farmer Education",
      description: "Supporting tea garden communities",
      color: "bg-blue-500/20 text-blue-100"
    },
    {
      icon: Recycle,
      title: "Plastic-Neutral & Carbon Conscious",
      description: "Environmental responsibility",
      color: "bg-green-500/20 text-green-100"
    },
    {
      icon: MapPin,
      title: "Garden-Level Transparency",
      description: "Complete supply chain visibility",
      color: "bg-amber-500/20 text-amber-100"
    },
    {
      icon: Award,
      title: "Certified Impact",
      description: "Verified ethical practices",
      color: "bg-purple-500/20 text-purple-100"
    }
  ];

  return (
    <section className="spacing-mobile bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <Leaf className="absolute top-10 left-10 w-20 h-20 transform rotate-12" />
        <Leaf className="absolute top-32 right-16 w-16 h-16 transform -rotate-45" />
        <Leaf className="absolute bottom-20 left-20 w-24 h-24 transform rotate-45" />
        <Leaf className="absolute bottom-32 right-32 w-18 h-18 transform -rotate-12" />
      </div>

      <div className="max-w-6xl mx-auto container-mobile relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-responsive-2xl font-display font-bold mb-3 md:mb-4">
            We Care for You, Our Farmers, and the Planet
          </h2>
          <p className="text-green-100 text-responsive-base max-w-3xl mx-auto mb-6 md:mb-8">
            Every cup makes a positive impact on communities and the environment
          </p>
          
          {/* Impact Counter */}
          <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 md:px-8 md:py-6">
            <div className="text-2xl md:text-4xl font-bold text-white font-display mb-1">
              2,498,585
            </div>
            <div className="text-responsive-sm text-green-200 font-medium">
              cups that created positive impact
            </div>
          </div>
        </div>
        
        {/* Impact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {impacts.map((impact, index) => (
            <div 
              key={index}
              className="group text-center p-4 md:p-6 bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 border border-white/10"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full mb-4 md:mb-6 transition-all duration-300 group-hover:scale-110 ${impact.color}`}>
                <impact.icon className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              
              {/* Content */}
              <h3 className="text-responsive-base font-display font-semibold mb-2 md:mb-3 leading-tight">
                {impact.title}
              </h3>
              <p className="text-green-100 text-responsive-sm leading-relaxed">
                {impact.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8 md:mt-12">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20">
            <div className="text-center sm:text-left">
              <div className="text-responsive-base font-medium text-white mb-1">
                Ready to make an impact?
              </div>
              <div className="text-responsive-sm text-green-200">
                Every purchase supports farmers and the environment
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-white text-green-700 px-4 py-2 md:px-6 md:py-3 rounded-full font-medium text-responsive-sm hover:bg-green-50 transition-colors cursor-pointer">
                Shop Now
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactBanner;
