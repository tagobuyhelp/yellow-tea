import dotenv from 'dotenv';
import mongoose from 'mongoose';
import slugify from 'slugify';
import Product from '../models/product.model.js';

dotenv.config();

const seedProducts = [
  {
    name: 'Assam Street-Style Masala Chai',
    subtitle: 'Bold & spicy authentic street chai blend',
    category: 'Trial Pack',
    type: ['Black', 'Masala'],
    flush: 'Summer',
    region: 'Assam',
    packaging: 'Whole Leaf',
    quantity: '2 Boxes (100g each)',
    price: 499,
    offer: 'Buy 10 Get 10 Free',
    gift_included: 'Yes',
    rating: 4.9,
    reviewCount: 173,
    badges: ['New', 'Bestseller', 'Gift'],
    taste_notes: ['Spicy', 'Bold', 'Warming'],
    tags: ['masala', 'chai', 'trial-pack', 'assam'],
    images: ['/uploads/Assam_Street-Style_Masala_Chai.png'],
    origin: { garden_name: 'Doomni Estate', elevation_ft: 1800, harvest_date: '2025-04-01' },
    brewing: { temperature_c: 100, time_min: 5, method: 'Simmer with milk' },
    scan_to_brew: { steps: ['Boil water', 'Add tea', 'Simmer with milk', 'Strain and serve'], timer_seconds: 300 }
  },
  {
    name: 'Darjeeling Earl Grey – Autumn Flush',
    subtitle: 'Premium bergamot-infused Darjeeling classic',
    category: 'Full Size',
    type: ['Black'],
    flush: 'Autumn',
    region: 'Darjeeling',
    packaging: 'Whole Leaf',
    quantity: '1 Tin (100g)',
    price: 699,
    offer: '10% Off + Free Steel Tea Scoop',
    gift_included: 'Yes',
    rating: 4.7,
    reviewCount: 92,
    badges: ['Organic', 'Gift'],
    taste_notes: ['Citrusy', 'Floral', 'Light-bodied'],
    tags: ['darjeeling', 'earl-grey', 'bergamot', 'gift'],
    images: ['/uploads/Darjeeling_Earl_Grey_Autumn_Flush.png'],
    origin: { garden_name: 'Makaibari Estate', elevation_ft: 4500, harvest_date: '2024-11-01' },
    brewing: { temperature_c: 90, time_min: 3, method: 'Western style' },
    scan_to_brew: { steps: ['Warm cup', 'Add 2g leaves', 'Steep', 'Strain'], timer_seconds: 180 }
  },
  {
    name: 'Assam Masala Tea',
    subtitle: 'Traditional Assamese masala blend',
    category: 'Trial Pack',
    type: ['Black', 'Masala'],
    flush: 'Summer',
    region: 'Assam',
    packaging: 'Whole Leaf',
    quantity: '100g',
    price: 399,
    offer: 'Free Sample Pack with Order',
    gift_included: 'No',
    rating: 4.8,
    reviewCount: 156,
    badges: ['Popular', 'Traditional'],
    taste_notes: ['Rich', 'Malty', 'Strong'],
    tags: ['assam', 'masala', 'milk-tea', 'trial-pack'],
    images: ['/uploads/Assam_Masala_Tea.png'],
    origin: { garden_name: 'Assam Valley', elevation_ft: 500, harvest_date: '2025-06-01' },
    brewing: { temperature_c: 100, time_min: 5, method: 'Boil with milk' },
    scan_to_brew: { steps: ['Boil water', 'Add tea', 'Add milk', 'Boil', 'Strain'], timer_seconds: 300 }
  },
  {
    name: 'Punjabi Masala Tea',
    subtitle: 'Rich cardamom & ginger spiced blend',
    category: 'Trial Pack',
    type: ['Black', 'Masala'],
    flush: 'Summer',
    region: 'Punjab',
    packaging: 'Whole Leaf',
    quantity: '100g',
    price: 449,
    offer: 'Buy 2 Get 20% Off',
    gift_included: 'No',
    rating: 4.7,
    reviewCount: 89,
    badges: ['Regional', 'Spiced'],
    taste_notes: ['Cardamom', 'Ginger', 'Robust'],
    tags: ['punjab', 'masala', 'cardamom', 'ginger'],
    images: ['/uploads/Punjabi_Masala_Tea.png'],
    origin: { garden_name: 'Punjab Plains', elevation_ft: 300, harvest_date: '2025-05-01' },
    brewing: { temperature_c: 100, time_min: 7, method: 'Boil with milk' },
    scan_to_brew: { steps: ['Boil water', 'Add tea', 'Add milk', 'Boil', 'Serve'], timer_seconds: 420 }
  },
  {
    name: 'Kolkata Street Tea',
    subtitle: 'Authentic Bengali street style brew',
    category: 'Trial Pack',
    type: ['Black'],
    flush: 'Summer',
    region: 'West Bengal',
    packaging: 'Whole Leaf',
    quantity: '100g',
    price: 349,
    offer: 'Free Delivery on First Order',
    gift_included: 'No',
    rating: 4.6,
    reviewCount: 134,
    badges: ['Street Style', 'Cultural'],
    taste_notes: ['Bold', 'Malty', 'Sweet'],
    tags: ['kolkata', 'street', 'bengal', 'chai'],
    images: ['/uploads/Kolkata_Street_Tea.png'],
    origin: { garden_name: 'Bengal Tea Gardens', elevation_ft: 200, harvest_date: '2025-04-01' },
    brewing: { temperature_c: 100, time_min: 4, method: 'Strong brew' },
    scan_to_brew: { steps: ['Boil water', 'Add tea', 'Steep', 'Strain'], timer_seconds: 240 }
  },
  {
    name: 'Bombay Cutting Tea',
    subtitle: 'Quick & strong Mumbai-style chai',
    category: 'Trial Pack',
    type: ['Black'],
    flush: 'Summer',
    region: 'Maharashtra',
    packaging: 'Whole Leaf',
    quantity: '100g',
    price: 379,
    offer: 'Mumbai Special: Free Shipping',
    gift_included: 'No',
    rating: 4.5,
    reviewCount: 98,
    badges: ['Mumbai Style', 'Popular'],
    taste_notes: ['Strong', 'Quick', 'Energizing'],
    tags: ['mumbai', 'cutting', 'chai', 'quick'],
    images: ['/uploads/Bombay_Cutting_Tea.png'],
    origin: { garden_name: 'Western Ghats', elevation_ft: 800, harvest_date: '2025-05-01' },
    brewing: { temperature_c: 100, time_min: 3, method: 'Cutting style' },
    scan_to_brew: { steps: ['Boil water', 'Add tea', 'Steep', 'Serve'], timer_seconds: 180 }
  },
  {
    name: 'Kashmiri Kahwa Saffron (Kesar) Green',
    subtitle: 'Luxurious saffron & almond green tea',
    category: 'Trial Pack',
    type: ['Green', 'Herbal'],
    flush: 'Spring',
    region: 'Kashmir',
    packaging: 'Teabags',
    quantity: '15 Teabags',
    price: 599,
    offer: 'Premium Saffron: Free Honey Sachet',
    gift_included: 'Yes',
    rating: 4.9,
    reviewCount: 78,
    badges: ['Premium', 'Saffron', 'Wellness'],
    taste_notes: ['Saffron', 'Almond', 'Aromatic'],
    tags: ['kashmir', 'kahwa', 'saffron', 'wellness'],
    images: ['/uploads/Kashmiri_Kahwa_Saffron_(Kesar)_Green.png'],
    origin: { garden_name: 'Kashmir Valley', elevation_ft: 5000, harvest_date: '2025-03-01' },
    brewing: { temperature_c: 85, time_min: 6, method: 'Steep' },
    scan_to_brew: { steps: ['Heat water', 'Steep teabag', 'Remove', 'Serve'], timer_seconds: 360 }
  },
  {
    name: 'Green Tea Rose Glow',
    subtitle: 'Beauty blend with organic rose petals',
    category: 'Full Size',
    type: ['Green'],
    flush: 'Summer',
    region: 'Kangra',
    packaging: 'Whole Leaf',
    quantity: '75g',
    price: 549,
    offer: 'Beauty Pack: Free Rose Petals',
    gift_included: 'No',
    rating: 4.8,
    reviewCount: 145,
    badges: ['Beauty', 'Organic', 'Bestseller'],
    taste_notes: ['Floral', 'Rose', 'Delicate'],
    tags: ['green-tea', 'rose', 'beauty', 'organic'],
    images: ['/uploads/Green_Tea_Rose_Glow.png'],
    origin: { garden_name: 'Kangra Valley', elevation_ft: 2500, harvest_date: '2025-07-01' },
    brewing: { temperature_c: 80, time_min: 3, method: 'Steep' },
    scan_to_brew: { steps: ['Warm cup', 'Add 2g leaves', 'Steep', 'Strain'], timer_seconds: 180 }
  },
  {
    name: 'Organic Green Tea Pure',
    subtitle: 'Pure & clean certified organic green tea',
    category: 'Full Size',
    type: ['Green'],
    flush: 'Spring',
    region: 'Nilgiri',
    packaging: 'Whole Leaf',
    quantity: '100g',
    price: 649,
    offer: 'Organic Certified: Free Infuser',
    gift_included: 'Yes',
    rating: 4.7,
    reviewCount: 167,
    badges: ['Organic', 'Pure', 'Certified'],
    taste_notes: ['Clean', 'Fresh', 'Grassy'],
    tags: ['organic', 'green-tea', 'nilgiri', 'health'],
    images: ['/uploads/GreenTeaPure.png'],
    origin: { garden_name: 'Nilgiri Hills', elevation_ft: 6000, harvest_date: '2025-03-01' },
    brewing: { temperature_c: 75, time_min: 3, method: 'Steep' },
    scan_to_brew: { steps: ['Heat water', 'Add leaves', 'Steep', 'Strain'], timer_seconds: 180 }
  },
  {
    name: 'Green Tea Ashwagandha Vitality',
    subtitle: 'Ayurvedic wellness green tea blend',
    category: 'Full Size',
    type: ['Green', 'Ayurvedic'],
    flush: 'Spring',
    region: 'Assam',
    packaging: 'Whole Leaf',
    quantity: '75g',
    price: 749,
    offer: 'Wellness Pack: Free Ashwagandha Guide',
    gift_included: 'Yes',
    rating: 4.9,
    reviewCount: 112,
    badges: ['Ayurvedic', 'Wellness', 'Premium'],
    taste_notes: ['Earthy', 'Herbal', 'Energizing'],
    tags: ['ashwagandha', 'ayurveda', 'vitality', 'wellness'],
    images: ['/uploads/Green_Tea_Ashwagandha_Vitality.png'],
    origin: { garden_name: 'Upper Assam', elevation_ft: 1200, harvest_date: '2025-02-01' },
    brewing: { temperature_c: 80, time_min: 4, method: 'Steep' },
    scan_to_brew: { steps: ['Heat water', 'Add leaves', 'Steep', 'Strain'], timer_seconds: 240 }
  },
  {
    name: 'Yellow Tea Festive Gift Box',
    subtitle: 'A curated trio of bestsellers for gifting',
    category: 'Gift Box',
    type: ['Assorted'],
    flush: '',
    region: 'India',
    packaging: 'Whole Leaf',
    quantity: '3 Tins (75g each)',
    price: 1299,
    offer: 'Limited Edition: Gift-ready packaging',
    gift_included: 'Yes',
    rating: 4.8,
    reviewCount: 64,
    badges: ['Gift', 'Limited'],
    taste_notes: ['Balanced', 'Aromatic', 'Comforting'],
    tags: ['gift-box', 'bestsellers', 'festive', 'assorted'],
    images: ['/uploads/20250714_0750_Elegant Tea Moment_simple_compose_01k03bn13rftavm556eqsshzm6.png'],
    origin: { garden_name: 'Curated Estates', elevation_ft: 0, harvest_date: '2025-01-01' },
    brewing: { temperature_c: 90, time_min: 3, method: 'Steep' },
    scan_to_brew: { steps: ['Pick a tea', 'Steep as directed', 'Enjoy'], timer_seconds: 180 }
  }
];

const toDateOrUndefined = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const normalizeProduct = (p) => {
  const slug = p.slug?.trim() ? p.slug.trim().toLowerCase() : slugify(p.name, { lower: true });

  return {
    ...p,
    slug,
    origin: {
      ...(p.origin || {}),
      harvest_date: toDateOrUndefined(p.origin?.harvest_date)
    }
  };
};

const main = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set. Add it to server/.env before running the seed.');
  }

  await mongoose.connect(mongoUri);

  const results = [];
  for (const product of seedProducts) {
    const normalized = normalizeProduct(product);
    const saved = await Product.findOneAndUpdate(
      { slug: normalized.slug },
      normalized,
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    results.push(saved);
  }

  const totalProducts = await Product.countDocuments();
  console.log(`Seeded/updated ${results.length} products. Total products in DB: ${totalProducts}`);

  await mongoose.connection.close();
};

main().catch(async (err) => {
  console.error(err);
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  } finally {
    process.exit(1);
  }
});
