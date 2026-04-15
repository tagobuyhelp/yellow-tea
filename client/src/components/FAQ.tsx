import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FAQ = () => {
  const faqs = [
    {
      question: "How fresh are Yellow Tea's products?",
      answer: "At Yellow Tea, freshness is our promise. We source the first pick of every season directly from partner tea gardens in Darjeeling, Assam, Nilgiris, and Kangra. Once the leaves arrive at our processing hub, they are stored in India's first dehumidified and temperature-controlled cold room for tea. This advanced facility protects the teas from their four natural enemies: light, oxygen, moisture, and heat. Within 24 hours, the teas are vacuum-packed at source and shipped globally, ensuring the leaves stay as vibrant and aromatic as the day they were plucked."
    },
    {
      question: "Are your teas 100% natural and free from additives?",
      answer: "Absolutely. We only offer pure, whole-leaf teas and natural herbal blends. No tea dust, no artificial flavors, no preservatives, and no synthetic colorings. What you see on the label is exactly what's in your cup."
    },
    {
      question: "How do I brew my Yellow Tea correctly?",
      answer: "Every tea is unique—and so is its ideal brewing style. We include brewing instructions on every pouch and sampler sticker, with guidance on water temperature, steeping time, and quantity.\n\nAs a general rule:\n• Green Tea: Steep at 80°C (not boiling) for 2–3 mins\n• Black Tea: Boiling water, 3–5 mins\n• Herbal/Tisane: Boiling water, 4–6 mins\n• Masala Tea: Simmer with milk and water for 5 mins, add sugar if desired\n\nUsing fresh, filtered water always brings out the best notes. You can also scan the QR code on your packet for video instructions!"
    },
    {
      question: "Where are your teas sourced from?",
      answer: "Our teas come directly from renowned tea-growing regions of India including Darjeeling, Assam, Nilgiris, and the Himalayan foothills. We work closely with small estates, women-led cooperatives, and sustainable farms to ensure every leaf is harvested with care and transparency. Each product page includes detailed sourcing information."
    },
    {
      question: "Where are your teas shipped from?",
      answer: "Our teas are packed and shipped from our primary facility located at the foothills of the Eastern Himalayas, India. This is the heart of our sourcing operations, ensuring that the product you receive is direct-from-origin, not from a warehouse shelf in a different country."
    },
    {
      question: "How long will my order take to arrive?",
      answer: "We process all orders within 1 business day of placement. After dispatch, shipping timelines depend on your chosen method:\n• Express Delivery: 5–8 business days (with tracking)\n• Standard Delivery: 12–18 business days\n\nAs soon as your order ships, we'll share a tracking link via email/SMS so you can follow your tea's journey from our hills to your home."
    },
    {
      question: "Why are Yellow Tea products more expensive than supermarket teas?",
      answer: "With us, you're not just buying tea, you're actually investing in purity, freshness, ethics, and quality.\n\nWhile we could reduce prices, that would mean:\n• No hand-plucked whole leaves\n• No cold-stored freshness\n• No ethical sourcing from Indian tea farmers\n• No climate-conscious packaging\n• No global delivery in under a week\n\nEvery Yellow Tea purchase supports rural livelihoods, sustainable farming, and women-led tea cooperatives. You're paying for a better brew and a better world."
    },
    {
      question: "Is Yellow Tea ethically sourced and sustainable?",
      answer: "Absolutely. Every tea you buy is traceable to its garden, and we maintain full transparency about harvest date, elevation, farmer partnerships, and sustainability practices. We also contribute 1% of revenue toward educating farmers' children, and we operate as a plastic-responsible and carbon-conscious brand, investing in clean energy and plastic recovery.\n\nWith Yellow Tea, your sip supports the planet and the people who bring you each leaf."
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Frequently Asked Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground whitespace-pre-line">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default FAQ;