import { Suspense } from 'react';
import Shop from '@/views/Shop';

export const metadata = {
  title: 'Shop Premium Indian Teas',
  description: 'Browse our collection of premium whole leaf teas from India\'s finest gardens. Assam, Darjeeling, Masala Chai, Green Teas, and Trial Packs.',
  keywords: [
    'buy tea online',
    'shop Indian tea',
    'premium tea collection',
    'Assam tea',
    'Darjeeling tea',
    'Masala Chai',
    'whole leaf tea',
    'green tea',
    'trial packs',
  ],
  alternates: {
    canonical: 'https://yellowtea.in/shop',
  },
  openGraph: {
    title: 'Shop Premium Indian Teas | Yellow Tea',
    description: 'Browse our collection of premium whole leaf teas from India\'s finest gardens.',
    url: 'https://yellowtea.in/shop',
    images: ['/uploads/logos/YellowTeaLogoPng.png'],
  },
};

const collectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Premium Indian Tea Catalog',
  description: 'Shop authentic whole leaf teas from Assam, Darjeeling, Kangra, and Nilgiri.',
  url: 'https://yellowtea.in/shop',
};

export default function ShopPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading tea collection...</div>}>
        <Shop />
      </Suspense>
    </>
  );
}
