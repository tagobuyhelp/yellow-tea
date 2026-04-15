import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5500/api/v1';

export interface ProductOrigin {
  garden_name: string;
  elevation_ft: number;
  harvest_date: string;
}

export interface ProductBrewing {
  temperature_c: number;
  time_min: number;
  method?: string;
}

export interface ScanToBrew {
  video_url?: string;
  steps: string[];
  timer_seconds?: number;
}

export interface Product {
  id: string | null;
  origin: ProductOrigin;
  brewing: ProductBrewing;
  scan_to_brew: ScanToBrew;
  reviewCount: number;
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
  offer: string;
  gift_included: string;
  rating: number;
  reviews_count: number;
  badges: string[];
  images: string[];
  taste_notes: string[];
  tags: string[];
  created_at?: string;
  qr_code?: string;
  formattedPrice: string;
}

export interface ProductsResponse {
  statusCode: number;
  data: {
    products: Product[];
    totalProducts: number;
    currentPage: number;
    totalPages: number;
    resultsPerPage: number;
  };
  message: string;
  success: boolean;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  category?: string;
  type?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
}

export const productsService = {
  async getProducts(params?: ProductQueryParams): Promise<ProductsResponse> {
    try {
      const response = await axios.get<ProductsResponse>(`${API_URL}/products`, {
        params
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch products');
    }
  },

  async getProductBySlug(slug: string): Promise<Product> {
    try {
      const response = await axios.get<{status: number; data: Product}>(`${API_URL}/products/${slug}`);
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to fetch product');
    }
  },

  async getCategories(): Promise<string[]> {
    try {
      const response = await axios.get<{status: number; data: string[]}>(`${API_URL}/products/categories`);
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to fetch categories');
    }
  },

  async getTopRated(limit: number = 5): Promise<Product[]> {
    try {
      const response = await axios.get<{status: number; data: Product[]}>(`${API_URL}/products/top-rated`, {
        params: { limit }
      });
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to fetch top rated products');
    }
  },

  async getProductsByBadge(badge: string): Promise<Product[]> {
    try {
      const response = await axios.get<{status: number; data: Product[]}>(`${API_URL}/products/badge/${badge}`);
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to fetch products by badge');
    }
  },

  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    try {
      const response = await axios.get<{status: number; data: Product[]}>(`${API_URL}/products/${productId}/related`, {
        params: { limit }
      });
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to fetch related products');
    }
  },

  async getNewArrivals(limit: number = 8, days: number = 30): Promise<Product[]> {
    try {
      const response = await axios.get<{status: number; data: Product[]}>(`${API_URL}/products/new-arrivals`, {
        params: { limit, days }
      });
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to fetch new arrivals');
    }
  },

  async getProductsByTaste(note: string): Promise<Product[]> {
    try {
      const response = await axios.get<{status: number; data: Product[]}>(`${API_URL}/products/taste/${note}`);
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to fetch products by taste');
    }
  },

  async getProductsByPriceRange(min: number, max: number): Promise<Product[]> {
    try {
      const response = await axios.get<{status: number; data: Product[]}>(`${API_URL}/products/price-range`, {
        params: { min, max }
      });
      return response.data.data;
    } catch (error) {
      throw new Error('Failed to fetch products by price range');
    }
  }
};