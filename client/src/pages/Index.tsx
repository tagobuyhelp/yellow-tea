
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Hero from "@/components/Hero";
import WelcomeBlock from "@/components/WelcomeBlock";
import PressMentions from "@/components/PressMentions";
import WhyChooseYellowTea from "@/components/WhyChooseYellowTea";
import QuoteCarousel from "@/components/QuoteCarousel";
import TrialPacksSection from "@/components/TrialPacksSection";
import AutumnFlushSection from "@/components/AutumnFlushSection";
import MasalaTeaSection from "@/components/MasalaTeaSection";
import GreenTeasSection from "@/components/GreenTeasSection";
import CommunityCounter from "@/components/CommunityCounter";
import ImpactBanner from "@/components/ImpactBanner";
import FAQ from "@/components/FAQ";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  // SEO
  useSEO({
    title: "Yellow Tea - Premium Indian Tea Collection | Whole Leaf, Ethically Sourced",
    description: "Discover Yellow Tea's premium collection of whole leaf teas directly sourced from India's finest gardens. Fresh, authentic, and delivered from garden to cup in 10 days.",
    keywords: "Yellow Tea, Indian Tea, whole leaf tea, premium tea, organic tea, Assam tea, Darjeeling tea, buy tea online, tea shop India",
    type: "website"
  });

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Content Sections - Compact Design */}
      <div className="bg-white shadow-sm">
        {/* Welcome Section */}
        <div className="border-b border-gray-100">
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
            <WelcomeBlock />
          </div>
        </div>

        {/* Press Mentions Section */}
        <div className="border-b border-gray-100">
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
            <PressMentions />
          </div>
        </div>

        {/* Why Choose Yellow Tea Section */}
        <div className="border-b border-gray-100">
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
            <WhyChooseYellowTea />
          </div>
        </div>

        {/* Customer Stories Section */}
        <div className="border-b border-gray-100">
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
            <QuoteCarousel />
          </div>
        </div>

        {/* Trial Packs Section */}
        <div className="border-b border-gray-100">
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
            <TrialPacksSection />
          </div>
        </div>

        {/* Autumn Flush Section */}
        <div className="border-b border-gray-100">
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
            <AutumnFlushSection />
          </div>
        </div>

        {/* Masala Tea Collection Section */}
        <div className="border-b border-gray-100">
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
            <MasalaTeaSection />
          </div>
        </div>

        {/* Green Tea Collection Section */}
        <div className="border-b border-gray-100">
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
            <GreenTeasSection />
          </div>
        </div>

        {/* Community Counter Section */}
        <div className="border-b border-gray-100">
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
            <CommunityCounter />
          </div>
        </div>

        {/* Impact Banner Section */}
        <div className="border-b border-gray-100">
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
            <ImpactBanner />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="border-b border-gray-100 last:border-b-0">
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
            <FAQ />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
