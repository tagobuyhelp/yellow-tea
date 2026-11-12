import About from '@/views/About';

export const metadata = {
  title: 'Our Story, Mission & Social Impact',
  description: "Learn about Yellow Tea's mission to deliver fresh, premium Indian teas while creating positive social impact in farming communities. Garden to cup in 10 days.",
  alternates: {
    canonical: 'https://yellowtea.in/about',
  },
  openGraph: {
    title: 'About Yellow Tea | Our Story & Mission',
    description: "Learn about Yellow Tea's mission to deliver fresh, premium Indian teas while creating positive social impact in farming communities.",
    url: 'https://yellowtea.in/about',
    images: ['/uploads/logos/YellowTeaLogoPng.png'],
  },
};

const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Yellow Tea',
  description: 'Our story of garden-fresh Indian tea and farmer welfare.',
  url: 'https://yellowtea.in/about',
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <About />
    </>
  );
}
