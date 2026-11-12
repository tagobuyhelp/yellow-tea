import Contact from '@/views/Contact';

export const metadata = {
  title: 'Customer Support & Inquiries',
  description: 'Get in touch with Yellow Tea customer service, wholesale inquiries, and tea support.',
  alternates: {
    canonical: 'https://yellowtea.in/contact',
  },
  openGraph: {
    title: 'Contact Yellow Tea',
    description: 'Get in touch with Yellow Tea customer service and tea support.',
    url: 'https://yellowtea.in/contact',
    images: ['/uploads/logos/YellowTeaLogoPng.png'],
  },
};

const contactSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Yellow Tea',
  url: 'https://yellowtea.in/contact',
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <Contact />
    </>
  );
}
