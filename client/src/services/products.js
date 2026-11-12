import axios from 'axios';
const API_URL = (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.VITE_API_BASE_URL)) || 'http://localhost:5500/api/v1';
export const productsService = {
    async getProducts(params) {
        try {
            const response = await axios.get(`${API_URL}/products`, {
                params
            });
            return response.data;
        }
        catch (error) {
            throw new Error('Failed to fetch products');
        }
    },
    async getProductBySlug(slug) {
        try {
            const response = await axios.get(`${API_URL}/products/${slug}`);
            return response.data.data;
        }
        catch (error) {
            throw new Error('Failed to fetch product');
        }
    },
    async getCategories() {
        try {
            const response = await axios.get(`${API_URL}/products/categories`);
            return response.data.data;
        }
        catch (error) {
            throw new Error('Failed to fetch categories');
        }
    },
    async getTopRated(limit = 5) {
        try {
            const response = await axios.get(`${API_URL}/products/top-rated`, {
                params: { limit }
            });
            return response.data.data;
        }
        catch (error) {
            throw new Error('Failed to fetch top rated products');
        }
    },
    async getProductsByBadge(badge) {
        try {
            const response = await axios.get(`${API_URL}/products/badge/${badge}`);
            return response.data.data;
        }
        catch (error) {
            throw new Error('Failed to fetch products by badge');
        }
    },
    async getRelatedProducts(productId, limit = 4) {
        try {
            const response = await axios.get(`${API_URL}/products/${productId}/related`, {
                params: { limit }
            });
            return response.data.data;
        }
        catch (error) {
            throw new Error('Failed to fetch related products');
        }
    },
    async getNewArrivals(limit = 8, days = 30) {
        try {
            const response = await axios.get(`${API_URL}/products/new-arrivals`, {
                params: { limit, days }
            });
            return response.data.data;
        }
        catch (error) {
            throw new Error('Failed to fetch new arrivals');
        }
    },
    async getProductsByTaste(note) {
        try {
            const response = await axios.get(`${API_URL}/products/taste/${note}`);
            return response.data.data;
        }
        catch (error) {
            throw new Error('Failed to fetch products by taste');
        }
    },
    async getProductsByPriceRange(min, max) {
        try {
            const response = await axios.get(`${API_URL}/products/price-range`, {
                params: { min, max }
            });
            return response.data.data;
        }
        catch (error) {
            throw new Error('Failed to fetch products by price range');
        }
    }
};
