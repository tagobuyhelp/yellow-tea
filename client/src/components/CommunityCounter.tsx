
import { useState, useEffect } from "react";
import { Users, Sparkles, TrendingUp } from "lucide-react";

const CommunityCounter = () => {
  const [count, setCount] = useState(2498585);
  const targetCount = 2498642;

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev < targetCount) {
          return prev + Math.floor(Math.random() * 3) + 1;
        }
        return targetCount;
      });
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, [targetCount]);

  return (
    <section className="spacing-mobile-sm bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full"></div>
        <div className="absolute top-32 right-16 w-16 h-16 border border-white/30 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 border border-white/40 rounded-full"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 border border-white/20 rounded-full"></div>
      </div>

      <div className="max-w-4xl mx-auto container-mobile text-center relative z-10">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
            <TrendingUp className="w-4 h-4 text-green-200" />
            <span className="text-white text-responsive-xs font-medium">Growing Daily</span>
          </div>
          
          <Users className="h-12 w-12 md:h-16 md:w-16 text-white/80 mx-auto mb-3 md:mb-4" />
          <h2 className="text-responsive-2xl font-display font-bold text-white mb-2">
            Join Our Tea Community
          </h2>
          <p className="text-green-100 text-responsive-base max-w-2xl mx-auto">
            Tea lovers worldwide who choose freshness and ethical sourcing
          </p>
        </div>
        
        {/* Counter Section */}
        <div className="relative">
          {/* Animated Background Circles */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-48 h-48 md:w-64 md:h-64 border border-white/20 rounded-full animate-pulse"></div>
            <div className="absolute w-32 h-32 md:w-48 md:h-48 border border-white/30 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute w-20 h-20 md:w-32 md:h-32 border border-white/40 rounded-full animate-pulse delay-500"></div>
          </div>
          
          {/* Main Counter */}
          <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl md:rounded-3xl p-6 md:p-8 mx-2 md:mx-4 border border-white/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-yellow-300 animate-pulse" />
              <span className="text-yellow-200 text-responsive-xs font-medium">Live Count</span>
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-yellow-300 animate-pulse" />
            </div>
            
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-white mb-2 font-mono tracking-tight">
              {count.toLocaleString()}
            </div>
            
            <div className="text-responsive-lg text-green-100 font-medium mb-2">
              and counting...
            </div>
            
            <div className="text-green-200 text-responsive-xs">
              Updated in real-time • Join the movement
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
              <div className="text-center">
                <div className="text-lg md:text-xl font-bold text-white">150+</div>
                <div className="text-responsive-xs text-green-200">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-xl font-bold text-white">Daily</div>
                <div className="text-responsive-xs text-green-200">New Members</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-xl font-bold text-white">4.9★</div>
                <div className="text-responsive-xs text-green-200">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityCounter;
