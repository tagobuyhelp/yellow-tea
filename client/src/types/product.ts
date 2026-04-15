
export interface Product {
  id: number;
  name: string;
  subtitle: string;
  slug: string;
  category: string;
  type: string[];
  flush: string;
  region: string;
  packaging: string;
  quantity: string;
  price: number;
  originalPrice: number;
  offer?: string;
  giftIncluded: boolean;
  rating: number;
  reviewCount: number;
  badges: string[];
  origin: string;
  harvestDate: string;
  brewing: {
    temperature: string;
    time: string;
  };
  tasteNotes: string[];
  tags: string[];
  image: string;
}
