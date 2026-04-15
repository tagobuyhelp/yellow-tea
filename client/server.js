import express from 'express';
import path from 'path';
import fs from 'fs';
import { load } from 'cheerio';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5550;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Import your products data
const { products } = await import('./server-data/products.js');

// SEO metadata injection middleware
app.use(async (req, res, next) => {
  // Only process HTML requests
  if (req.path.endsWith('.html') || req.path === '/' || !req.path.includes('.')) {
    try {
      const htmlPath = path.join(__dirname, 'dist/index.html');
      const html = fs.readFileSync(htmlPath, 'utf8');
      const enrichedHtml = await enrichMetadata(html, req.path);
      res.send(enrichedHtml);
    } catch (error) {
      console.error('Error serving page:', error);
      next();
    }
  } else {
    next();
  }
});

const enrichMetadata = async (html, path) => {
  try {
    const $ = load(html);
    
    // Default metadata
    let title = 'Yellow Tea - Premium Indian Tea Collection';
    let description = 'Premium whole leaf teas from India\'s finest gardens. Fresh, authentic, and delivered from garden to cup in 10 days.';
    let keywords = 'Yellow Tea, Indian Tea, whole leaf tea, premium tea, organic tea, Assam tea, Darjeeling tea, buy tea online, tea shop India';
    let ogImage = 'https://yellowtea.in/uploads/site_logo.jpg';
    let ogUrl = `https://yellowtea.in${path}`;

    // Route-specific metadata
    if (path === '/') {
      title = 'Yellow Tea - Premium Indian Tea Collection | Whole Leaf, Ethically Sourced';
      description = 'Discover Yellow Tea\'s premium collection of whole leaf teas directly sourced from India\'s finest gardens. Fresh, authentic, and delivered from garden to cup in 10 days.';
    } else if (path === '/shop') {
      title = 'Shop Premium Indian Teas | Yellow Tea';
      description = 'Browse our collection of premium whole leaf teas from India\'s finest gardens. Assam, Darjeeling, Masala Chai, and more.';
      keywords = 'buy tea online, shop Indian tea, premium tea collection, Assam tea, Darjeeling tea, Masala Chai, whole leaf tea';
    } else if (path === '/about') {
      title = 'About Yellow Tea | Our Story & Mission';
      description = 'Learn about Yellow Tea\'s mission to bring you the finest Indian teas directly from garden to cup. Our story of quality, authenticity, and sustainability.';
      keywords = 'about Yellow Tea, tea company story, Indian tea mission, sustainable tea, tea sourcing';
    } else if (path === '/contact') {
      title = 'Contact Yellow Tea | Get in Touch';
      description = 'Contact Yellow Tea for customer support, wholesale inquiries, or any questions about our premium Indian tea collection.';
      keywords = 'contact Yellow Tea, customer support, tea wholesale, tea inquiries';
    } else if (path.startsWith('/product/')) {
      // Extract product slug from path
      const productSlug = path.replace('/product/', '');
      const product = products.find(p => p.slug === productSlug);
      
      if (product) {
        title = `${product.name} | Yellow Tea`;
        description = product.description || `Premium ${product.name} from Yellow Tea. Whole leaf, ethically sourced, and delivered fresh from India's finest gardens.`;
        keywords = `${product.name}, ${product.category}, Indian tea, whole leaf tea, premium tea, Yellow Tea`;
        ogImage = product.images?.[0] || 'https://yellowtea.in/uploads/site_logo.jpg';
      }
    }

    // Update meta tags
    $('title').text(title);
    $('meta[name="description"]').attr('content', description);
    $('meta[name="keywords"]').attr('content', keywords);
    
    // Update canonical URL
    let canonicalLink = $('link[rel="canonical"]');
    if (canonicalLink.length === 0) {
      // Add canonical link if it doesn't exist
      $('head').append(`<link rel="canonical" href="${ogUrl}" />`);
    } else {
      // Update existing canonical link
      canonicalLink.attr('href', ogUrl);
    }
    
    // Update Open Graph tags
    $('meta[property="og:title"]').attr('content', title);
    $('meta[property="og:description"]').attr('content', description);
    $('meta[property="og:url"]').attr('content', ogUrl);
    $('meta[property="og:image"]').attr('content', ogImage);
    
    // Update Twitter tags
    $('meta[name="twitter:title"]').attr('content', title);
    $('meta[name="twitter:description"]').attr('content', description);
    $('meta[name="twitter:image"]').attr('content', ogImage);

    // Log SEO updates for debugging
    console.log(`🔍 SEO Updated for ${path}:`);
    console.log(`   Title: ${title}`);
    console.log(`   Canonical: ${ogUrl}`);
    console.log(`   Description: ${description.substring(0, 60)}...`);

    return $.html();
  } catch (error) {
    console.error('Error enriching metadata:', error);
    return html;
  }
};

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 SEO injection enabled for all routes`);
}); 