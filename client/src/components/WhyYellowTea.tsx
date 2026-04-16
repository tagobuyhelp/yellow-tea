import { Leaf, Truck, ShieldCheck, Heart } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Leaf,
    title: "100% Whole Leaf Tea",
    desc: "No dust or fannings — only full leaves for richer flavor and aroma.",
  },
  {
    icon: Truck,
    title: "Garden to Cup in Days",
    desc: "Sourced fresh and delivered within 8–10 days for peak quality.",
  },
  {
    icon: ShieldCheck,
    title: "Pure & Unblended",
    desc: "No artificial flavors, additives, or fillers — just authentic tea.",
  },
  {
    icon: Heart,
    title: "Ethically Sourced",
    desc: "Direct partnerships supporting tea farmers and sustainable practices.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const WhyYellowTea = () => {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-heading font-semibold text-gray-900 mb-4">
            Why Choose Yellow Tea?
          </h2>
          <p className="text-gray-600 text-lg">
            Authentic, fresh, and responsibly sourced — experience tea the way it should be.
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
                className="group bg-[#FFF8E6] rounded-xl p-6 text-center hover:shadow-md transition transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-white shadow-sm">
                  <Icon className="w-6 h-6 text-[#F4B400]" />
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-14">
          <button className="bg-[#F4B400] text-black px-6 py-3 rounded-lg font-medium hover:bg-[#FFD54F] transition">
            Explore Collection
          </button>
        </div>

      </div>
    </section>
  );
};

export default WhyYellowTea;