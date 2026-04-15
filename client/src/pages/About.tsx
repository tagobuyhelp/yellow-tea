import { Leaf, Heart, Users, Award, Truck, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useSEO } from "@/hooks/useSEO";

const About = () => {
  // SEO
  useSEO({
    title: "About Yellow Tea | Our Story, Mission & Social Impact",
    description: "Learn about Yellow Tea's mission to deliver fresh, premium Indian teas while creating positive social impact in farming communities. Garden to cup in 10 days.",
    keywords: "Yellow Tea story, tea company mission, social impact tea, Indian tea brand, sustainable tea farming",
    type: "website"
  });

  const values = [
    {
      icon: Leaf,
      title: "Garden to Cup in 10 Days",
      description: "We ensure maximum freshness by delivering tea directly from gardens to your cup within 10 days of harvest."
    },
    {
      icon: Heart,
      title: "Social Impact",
      description: "Every purchase helps educate farmers' children and supports sustainable farming practices in tea-growing regions."
    },
    {
      icon: Users,
      title: "Community First",
      description: "We work directly with tea farmers and their communities to ensure fair wages and sustainable livelihoods."
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "Our teas are carefully selected from the finest gardens across India, ensuring exceptional taste and quality."
    },
    {
      icon: Truck,
      title: "Global Shipping",
      description: "We deliver our premium teas worldwide, bringing authentic Indian tea culture to your doorstep."
    },
    {
      icon: Shield,
      title: "Eco-Friendly",
      description: "We offset CO₂ emissions and eliminate plastic waste through sustainable packaging and carbon-neutral shipping."
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">About Yellow Tea</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A premium D2C tea brand committed to delivering the freshest teas while creating positive impact in farming communities across India.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              To revolutionize the tea industry by creating direct connections between tea gardens and tea lovers, 
              ensuring freshness, quality, and positive social impact with every cup.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <value.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Our Story</h2>
            <div className="prose prose-lg mx-auto text-muted-foreground">
              <p className="mb-6">
                Yellow Tea was born from a simple belief: that exceptional tea should be fresh, ethical, and accessible to everyone. 
                Our journey began with a visit to the tea gardens of Assam and Darjeeling, where we witnessed firsthand the dedication 
                of tea farmers and the challenges they face.
              </p>
              <p className="mb-6">
                We realized that traditional tea supply chains often meant that tea could sit in warehouses for months or even years 
                before reaching consumers. This not only compromised the quality and freshness but also meant that farmers received 
                a fraction of the final selling price.
              </p>
              <p className="mb-6">
                That's when we decided to create a direct-to-consumer brand that would eliminate intermediaries, ensure maximum 
                freshness with our "Garden to Cup in 10 Days" promise, and create meaningful impact in farming communities through 
                education and sustainable practices.
              </p>
              <p>
                Today, Yellow Tea stands as a testament to what's possible when quality, freshness, and social responsibility come together. 
                Every cup you enjoy supports not just your wellness, but also the wellbeing of farming communities across India.
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
};

export default About;