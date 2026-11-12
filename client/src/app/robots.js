export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/checkout/',
          '/cart/',
          '/profile/',
          '/order-success/',
        ],
      },
    ],
    sitemap: 'https://yellowtea.in/sitemap.xml',
  };
}

