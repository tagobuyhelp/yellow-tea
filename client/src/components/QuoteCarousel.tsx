
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const QuoteCarousel = () => {
  const quotes = [
    {
      text: "Yellow Tea brings the true taste of Assam and Darjeeling to my home. The freshness is unmatched!",
      author: "Ananya Mukherjee",
      title: "Tea Connoisseur, Kolkata"
    },
    {
      text: "As a chef, I appreciate the authentic flavors and ethical sourcing. Yellow Tea is my go-to for premium blends.",
      author: "Chef Rohan Singh",
      title: "Executive Chef, Mumbai"
    },
    {
      text: "The wellness blends are a daily ritual for me. I love the eco-friendly packaging and quick delivery.",
      author: "Dr. Meera Iyer",
      title: "Ayurveda & Wellness Expert, Bengaluru"
    },
    {
      text: "My family enjoys the variety and quality. The vacuum-sealed packs really lock in the aroma and taste.",
      author: "Vikram Patel",
      title: "Entrepreneur, Ahmedabad"
    }
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  const nextQuote = () => {
    setCurrentQuote((prev) => (prev + 1) % quotes.length);
  };

  const prevQuote = () => {
    setCurrentQuote((prev) => (prev - 1 + quotes.length) % quotes.length);
  };

  return (
    <section className="spacing-mobile bg-gradient-to-br from-amber-50 via-orange-50 to-green-50">
      <div className="max-w-5xl mx-auto container-mobile">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <Quote className="h-8 w-8 md:h-12 md:w-12 text-amber-600 mx-auto mb-3 md:mb-4" />
          <h2 className="text-responsive-2xl font-display font-bold text-gray-800 mb-2">
            What Tea Lovers Say
          </h2>
          <p className="text-responsive-sm text-gray-600">Real testimonials from our tea community</p>
        </div>
        
        <div className="relative">
          {/* Quotes Container */}
          <div className="overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm p-4 md:p-8">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentQuote * 100}%)` }}
            >
              {quotes.map((quote, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="text-center px-2 md:px-8">
                    <p className="text-responsive-lg font-serif-display font-light text-gray-700 leading-relaxed mb-6 md:mb-8 italic">
                      "{quote.text}"
                    </p>
                    <div className="space-y-1">
                      <p className="font-display font-semibold text-gray-800 text-responsive-base">
                        {quote.author}
                      </p>
                      <p className="text-amber-600 font-medium text-responsive-sm">
                        {quote.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-center items-center mt-6 md:mt-8 space-x-4">
            <button 
              onClick={prevQuote}
              className="p-2 md:p-3 rounded-full bg-white hover:bg-amber-50 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100"
              aria-label="Previous quote"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
            </button>
            
            <div className="flex space-x-2">
              {quotes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuote(index)}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-200 ${
                    index === currentQuote ? 'bg-amber-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to quote ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              onClick={nextQuote}
              className="p-2 md:p-3 rounded-full bg-white hover:bg-amber-50 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100"
              aria-label="Next quote"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteCarousel;
