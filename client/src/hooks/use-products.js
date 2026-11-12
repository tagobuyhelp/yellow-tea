'use client';
import { useState, useEffect } from 'react';
import { productsService } from '@/services/products';
export function useProducts(initialParams) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalProducts, setTotalProducts] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        fetchProducts(initialParams);
        fetchCategories();
    }, []);
    const fetchProducts = async (params) => {
        try {
            setLoading(true);
            const response = await productsService.getProducts(params);
            setProducts(response.data.products);
            setTotalProducts(response.data.totalProducts);
            setCurrentPage(response.data.currentPage);
            setTotalPages(response.data.totalPages);
            setError(null);
        }
        catch (err) {
            setError('Failed to fetch products');
        }
        finally {
            setLoading(false);
        }
    };
    const fetchCategories = async () => {
        try {
            const data = await productsService.getCategories();
            setCategories(data);
        }
        catch (err) {
            console.error('Failed to fetch categories');
        }
    };
    const getProductBySlug = async (slug) => {
        try {
            setLoading(true);
            const product = await productsService.getProductBySlug(slug);
            return product;
        }
        catch (err) {
            setError('Failed to fetch product');
            return null;
        }
        finally {
            setLoading(false);
        }
    };
    const getTopRated = async (limit) => {
        try {
            const products = await productsService.getTopRated(limit);
            return products;
        }
        catch (err) {
            setError('Failed to fetch top rated products');
            return [];
        }
    };
    const getNewArrivals = async (limit, days) => {
        try {
            const products = await productsService.getNewArrivals(limit, days);
            return products;
        }
        catch (err) {
            setError('Failed to fetch new arrivals');
            return [];
        }
    };
    const getProductsByBadge = async (badge) => {
        try {
            const products = await productsService.getProductsByBadge(badge);
            return products;
        }
        catch (err) {
            setError('Failed to fetch products by badge');
            return [];
        }
    };
    const getProductsByTaste = async (note) => {
        try {
            const products = await productsService.getProductsByTaste(note);
            return products;
        }
        catch (err) {
            setError('Failed to fetch products by taste');
            return [];
        }
    };
    const getRelatedProducts = async (productId, limit) => {
        try {
            const products = await productsService.getRelatedProducts(productId, limit);
            return products;
        }
        catch (err) {
            setError('Failed to fetch related products');
            return [];
        }
    };
    return {
        products,
        loading,
        error,
        totalProducts,
        currentPage,
        totalPages,
        fetchProducts,
        getProductBySlug,
        getTopRated,
        getNewArrivals,
        getProductsByBadge,
        getProductsByTaste,
        getRelatedProducts,
        categories
    };
}
