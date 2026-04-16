import { Leaf, Truck, ShieldCheck, Star } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Leaf,
    title: "100% Whole Leaf Tea",
    desc: "No dust, no fannings — only premium whole leaves for a richer taste.",
  },
  {
    icon: Truck,
    title: "Garden to Cup in Days",
    desc: "Freshly sourced and delivered within 8–10 days for peak freshness.",
  },
  {
    icon: ShieldCheck,
    title: "Ethically Sourced",
    desc: "Direct partnerships with tea estates supporting farmers sustainably.",
  },
  {
    icon: Star,
    title: "Trusted by Thousands",
    desc: "Loved by 50,000+ tea enthusiasts across India.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const WhyChooseYellowTea = () => {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-heading font-semibold text-gray-900 mb-4">
            Why Choose Yellow Tea?
          </h2>
          <p className="text-gray-600 text-lg">
            Experience purity, freshness, and authenticity in every cup.
          </p>
        </div>

        {/* Features */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.12 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-[#FFF8E6] rounded-xl p-6 text-center hover:shadow-md transition transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-white shadow-sm">
                  <Icon className="w-6 h-6 text-[#F4B400]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <button className="bg-[#F4B400] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#FFD54F] transition">
            Explore Collection
          </button>
        </div>

      </div>
    </section>
  );
};

export default WhyChooseYellowTea;