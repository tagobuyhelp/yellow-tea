import { Suspense } from 'react';
import ProductDetails from '@/views/ProductDetails';
import { products } from '@/data/products';

export async function generateStaticParams() {
  return products.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return {
      title: 'Tea Not Found | Yellow Tea',
      description: 'The requested tea product could not be found.',
    };
  }

  const title = product.name;
  const description = `${product.subtitle}. Whole leaf tea from ${product.region}. Notes: ${product.tasteNotes?.join(', ') || 'Fresh & Aromatic'}. Garden to cup in 10 days.`;
  const imageUrl = product.image?.startsWith('http')
    ? product.image
    : `https://yellowtea.in${product.image}`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.category,
      product.region,
      ...(product.tags || []),
      'Indian tea',
      'whole leaf tea',
      'premium tea',
    ],
    alternates: {
      canonical: `https://yellowtea.in/product/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://yellowtea.in/product/${slug}`,
      siteName: 'Yellow Tea',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function ProductPage({ params }) {
  const { slug } = params;
  const product = products.find((p) => p.slug === slug);

  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: [
          product.image?.startsWith('http')
            ? product.image
            : `https://yellowtea.in${product.image}`,
        ],
        description: product.subtitle,
        sku: product.slug,
        brand: {
          '@type': 'Brand',
          name: 'Yellow Tea',
        },
        offers: {
          '@type': 'Offer',
          url: `https://yellowtea.in/product/${product.slug}`,
          priceCurrency: 'INR',
          price: product.price,
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating || 4.8,
          reviewCount: product.reviewCount || 100,
        },
      }
    : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://yellowtea.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: 'https://yellowtea.in/shop',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product ? product.name : 'Tea Details',
        item: `https://yellowtea.in/product/${slug}`,
      },
    ],
  };

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading product...</div>}>
        <ProductDetails />
      </Suspense>
    </>
  );
}
