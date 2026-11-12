import '@/index.css';
import Providers from './providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BottomNavigation } from '@/components/BottomNavigation';

export const metadata = {
  metadataBase: new URL('https://yellowtea.in'),
  title: {
    default: 'Yellow Tea - Premium Indian Tea Collection | Whole Leaf, Ethically Sourced',
    template: '%s | Yellow Tea',
  },
  description: "Discover Yellow Tea's premium collection of whole leaf teas directly sourced from India's finest gardens. Fresh, authentic, and delivered from garden to cup in 10 days.",
  keywords: [
    'Yellow Tea',
    'Indian Tea',
    'whole leaf tea',
    'premium tea',
    'organic tea',
    'Assam tea',
    'Darjeeling tea',
    'buy tea online',
    'tea shop India',
    'Masala chai',
    'green tea',
    'orthodox tea',
  ],
  authors: [{ name: 'Yellow Tea', url: 'https://yellowtea.in' }],
  creator: 'Yellow Tea',
  publisher: 'Tagobuy IT Services',
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Yellow Tea - Premium Indian Tea Collection',
    description: "Premium whole leaf teas from India's finest gardens. Fresh, authentic, and delivered from garden to cup in 10 days.",
    url: 'https://yellowtea.in',
    siteName: 'Yellow Tea',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/uploads/logos/YellowTeaLogoPng.png',
        width: 1200,
        height: 630,
        alt: 'Yellow Tea - Premium Indian Tea Collection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yellow Tea - Premium Indian Tea Collection',
    description: "Premium whole leaf teas from India's finest gardens. Fresh, authentic, and delivered from garden to cup in 10 days.",
    creator: '@yellowtea',
    images: ['/uploads/logos/YellowTeaLogoPng.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/uploads/logos/YellowTeaLogoPng.png',
    shortcut: '/uploads/logos/YellowTeaLogoPng.png',
    apple: '/uploads/logos/YellowTeaLogoPng.png',
  },
};

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Yellow Tea',
  url: 'https://yellowtea.in',
  logo: 'https://yellowtea.in/uploads/logos/YellowTeaLogoPng.png',
  sameAs: [
    'https://www.instagram.com/yellowtea',
    'https://www.facebook.com/yellowtea',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-9876543210',
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['en', 'hi'],
  },
  description: 'Yellow Tea offers premium Indian whole leaf teas sourced directly from ethical tea gardens. Freshness guaranteed, garden to cup in 10 days.',
};

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Yellow Tea',
  url: 'https://yellowtea.in',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://yellowtea.in/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
