import Index from '@/views/Index';

export const metadata = {
  title: 'Yellow Tea - Premium Indian Tea Collection | Whole Leaf, Ethically Sourced',
  description: "Discover Yellow Tea's premium collection of whole leaf teas directly sourced from India's finest gardens. Fresh, authentic, and delivered from garden to cup in 10 days.",
  alternates: {
    canonical: 'https://yellowtea.in/',
  },
  openGraph: {
    title: 'Yellow Tea - Premium Indian Tea Collection',
    description: "Discover Yellow Tea's premium collection of whole leaf teas directly sourced from India's finest gardens.",
    url: 'https://yellowtea.in/',
    siteName: 'Yellow Tea',
    images: [
      {
        url: '/uploads/logos/YellowTeaLogoPng.png',
        width: 1200,
        height: 630,
        alt: 'Yellow Tea Collection',
      },
    ],
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What makes Yellow Tea unique?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yellow Tea sources whole leaf teas directly from premium estates in Assam, Darjeeling, and Kangra, delivering from garden to cup in under 10 days for maximum freshness and flavor.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are Yellow Tea products 100% natural and ethically sourced?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! All our teas are single-origin or ethically crafted with natural spices and herbs, supporting sustainable tea garden communities.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I brew Yellow Tea for best taste?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Each package includes precise water temperature, steeping time, and brewing guidelines, plus a Scan-to-Brew QR code with video instructions.',
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Index />
    </>
  );
}
