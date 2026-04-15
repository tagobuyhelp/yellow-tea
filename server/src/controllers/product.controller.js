import Product from '../models/product.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';
import slugify from 'slugify';
import mongoose from 'mongoose';

/**
 * @desc    Create a new product
 * @route   POST /api/v1/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res, next) => {
    try {
        const { name } = req.body;
        
        // Check if product with same name exists
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return next(new ApiError(400, 'Product with this name already exists'));
        }
        
        // Generate slug from name
        req.body.slug = slugify(name, { lower: true });
        
        // Handle image uploads if files are present
        if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map(file => 
                uploadToCloudinary(file, 'products')
            );
            
            const uploadedImages = await Promise.all(imagePromises);
            req.body.images = uploadedImages.map(img => img.url);
        }
        
        const product = await Product.create(req.body);
        
        res.status(201).json(
            new ApiResponse(201, product, 'Product created successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all products with filtering, sorting, pagination
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getAllProducts = async (req, res, next) => {
    try {
        // BUILD QUERY
        // 1) Filtering
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
        excludedFields.forEach(field => delete queryObj[field]);
        
        // Advanced filtering for price ranges, etc.
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `${match}`);
        
        let query = Product.find(JSON.parse(queryStr));
        
        // 2) Search functionality
        if (req.query.search) {
            query = query.find({ $text: { $search: req.query.search } });
        }
        
        // 3) Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-created_at');
        }
        
        // 4) Field limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }
        
        // 5) Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        
        query = query.skip(skip).limit(limit);
        
        // EXECUTE QUERY
        const products = await query;
        
        // Get total count for pagination info
        const totalProducts = await Product.countDocuments(JSON.parse(queryStr));
        
        res.status(200).json(
            new ApiResponse(200, {
                products,
                totalProducts,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                resultsPerPage: limit
            }, 'Products retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single product by ID or slug
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
export const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        let product;
        
        // Check if id is a valid MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(id)) {
            product = await Product.findById(id);
        } else {
            // If not a valid ObjectId, try to find by slug
            product = await Product.findOne({ slug: id });
        }
        
        if (!product) {
            return next(new ApiError(404, 'Product not found'));
        }
        
        res.status(200).json(
            new ApiResponse(200, product, 'Product retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update product
 * @route   PUT /api/v1/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // If name is being updated, update slug as well
        if (req.body.name) {
            req.body.slug = slugify(req.body.name, { lower: true });
        }
        
        // Handle image uploads if files are present
        if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map(file => 
                uploadToCloudinary(file, 'products')
            );
            
            const uploadedImages = await Promise.all(imagePromises);
            req.body.images = uploadedImages.map(img => img.url);
        }
        
        const product = await Product.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return next(new ApiError(404, 'Product not found'));
        }
        
        res.status(200).json(
            new ApiResponse(200, product, 'Product updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/v1/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findByIdAndDelete(id);
        
        if (!product) {
            return next(new ApiError(404, 'Product not found'));
        }
        
        res.status(200).json(
            new ApiResponse(200, null, 'Product deleted successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get product categories
 * @route   GET /api/v1/products/categories
 * @access  Public
 */
export const getProductCategories = async (req, res, next) => {
    try {
        const categories = await Product.distinct('category');
        
        res.status(200).json(
            new ApiResponse(200, categories, 'Product categories retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get product types
 * @route   GET /api/v1/products/types
 * @access  Public
 */
export const getProductTypes = async (req, res, next) => {
    try {
        const types = await Product.distinct('type');
        
        res.status(200).json(
            new ApiResponse(200, types, 'Product types retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get top rated products
 * @route   GET /api/v1/products/top-rated
 * @access  Public
 */
export const getTopRatedProducts = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 5;
        
        const products = await Product.find({})
            .sort({ rating: -1 })
            .limit(limit);
        
        res.status(200).json(
            new ApiResponse(200, products, 'Top rated products retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get products by badge
 * @route   GET /api/v1/products/badge/:badge
 * @access  Public
 */
export const getProductsByBadge = async (req, res, next) => {
    try {
        const { badge } = req.params;
        
        const products = await Product.find({ badges: badge });
        
        res.status(200).json(
            new ApiResponse(200, products, `Products with badge '${badge}' retrieved successfully`)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get related products
 * @route   GET /api/v1/products/:id/related
 * @access  Public
 */
export const getRelatedProducts = async (req, res, next) => {
    try {
        const { id } = req.params;
        const limit = parseInt(req.query.limit, 10) || 4;
        
        // Find the current product
        const product = await Product.findById(id);
        
        if (!product) {
            return next(new ApiError(404, 'Product not found'));
        }
        
        // Find products with the same category or type, excluding the current product
        const relatedProducts = await Product.find({
            _id: { $ne: id },
            $or: [
                { category: product.category },
                { type: { $in: product.type } }
            ]
        })
        .limit(limit);
        
        res.status(200).json(
            new ApiResponse(200, relatedProducts, 'Related products retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get products by region
 * @route   GET /api/v1/products/region/:region
 * @access  Public
 */
export const getProductsByRegion = async (req, res, next) => {
    try {
        const { region } = req.params;
        
        const products = await Product.find({ region });
        
        res.status(200).json(
            new ApiResponse(200, products, `Products from region '${region}' retrieved successfully`)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get products by flush (season)
 * @route   GET /api/v1/products/flush/:flush
 * @access  Public
 */
export const getProductsByFlush = async (req, res, next) => {
    try {
        const { flush } = req.params;
        
        const products = await Product.find({ flush });
        
        res.status(200).json(
            new ApiResponse(200, products, `Products from ${flush} flush retrieved successfully`)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get products by price range
 * @route   GET /api/v1/products/price-range
 * @access  Public
 */
export const getProductsByPriceRange = async (req, res, next) => {
    try {
        const { min, max } = req.query;
        
        if (!min || !max) {
            return next(new ApiError(400, 'Please provide both min and max price values'));
        }
        
        const products = await Product.find({
            price: { $gte: min, $lte: max }
        });
        
        res.status(200).json(
            new ApiResponse(200, products, `Products in price range ₹${min} - ₹${max} retrieved successfully`)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get product stats
 * @route   GET /api/v1/products/stats
 * @access  Private/Admin
 */
export const getProductStats = async (req, res, next) => {
    try {
        // Total products count
        const totalProducts = await Product.countDocuments();
        
        // Products by category
        const productsByCategory = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        // Products by type
        const productsByType = await Product.aggregate([
            {
                $unwind: '$type'
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        // Products by region
        const productsByRegion = await Product.aggregate([
            {
                $group: {
                    _id: '$region',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        // Average product price
        const avgPrice = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    avgPrice: { $avg: '$price' }
                }
            }
        ]);
        
        res.status(200).json(
            new ApiResponse(200, {
                totalProducts,
                productsByCategory,
                productsByType,
                productsByRegion,
                averagePrice: avgPrice.length > 0 ? avgPrice[0].avgPrice : 0
            }, 'Product statistics retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update product images
 * @route   PUT /api/v1/products/:id/images
 * @access  Private/Admin
 */
export const updateProductImages = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Check if product exists
        const product = await Product.findById(id);
        
        if (!product) {
            return next(new ApiError(404, 'Product not found'));
        }
        
        // Handle image uploads if files are present
        if (!req.files || req.files.length === 0) {
            return next(new ApiError(400, 'Please upload at least one image'));
        }
        
        const imagePromises = req.files.map(file => 
            uploadToCloudinary(file, 'products')
        );
        
        const uploadedImages = await Promise.all(imagePromises);
        const newImages = uploadedImages.map(img => img.url);
        
        // Update product with new images
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { 
                $push: { 
                    images: { $each: newImages } 
                } 
            },
            { new: true }
        );
        
        res.status(200).json(
            new ApiResponse(200, updatedProduct, 'Product images updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Remove product image
 * @route   DELETE /api/v1/products/:id/images/:imageUrl
 * @access  Private/Admin
 */
export const removeProductImage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;
        
        if (!imageUrl) {
            return next(new ApiError(400, 'Please provide the image URL to remove'));
        }
        
        // Check if product exists
        const product = await Product.findById(id);
        
        if (!product) {
            return next(new ApiError(404, 'Product not found'));
        }
        
        // Check if image exists in product
        if (!product.images.includes(imageUrl)) {
            return next(new ApiError(404, 'Image not found in product'));
        }
        
        // Remove image from product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $pull: { images: imageUrl } },
            { new: true }
        );
        
        // TODO: Consider deleting the image from Cloudinary as well
        
        res.status(200).json(
            new ApiResponse(200, updatedProduct, 'Product image removed successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get new arrivals
 * @route   GET /api/v1/products/new-arrivals
 * @access  Public
 */
export const getNewArrivals = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 8;
        const days = parseInt(req.query.days, 10) || 30;
        
        // Calculate date for new arrivals (e.g., products added in the last 30 days)
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);
        
        const products = await Product.find({
            created_at: { $gte: dateThreshold }
        })
        .sort({ created_at: -1 })
        .limit(limit);
        
        res.status(200).json(
            new ApiResponse(200, products, 'New arrivals retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get products by taste notes
 * @route   GET /api/v1/products/taste/:note
 * @access  Public
 */
export const getProductsByTasteNote = async (req, res, next) => {
    try {
        const { note } = req.params;
        
        const products = await Product.find({ taste_notes: note });
        
        res.status(200).json(
            new ApiResponse(200, products, `Products with taste note '${note}' retrieved successfully`)
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Bulk update products
 * @route   PATCH /api/v1/products/bulk-update
 * @access  Private/Admin
 */
export const bulkUpdateProducts = async (req, res, next) => {
    try {
        const { products } = req.body;
        
        if (!products || !Array.isArray(products) || products.length === 0) {
            return next(new ApiError(400, 'Please provide an array of products to update'));
        }
        
        const updatePromises = products.map(product => {
            const { id, ...updateData } = product;
            
            // If name is being updated, update slug as well
            if (updateData.name) {
                updateData.slug = slugify(updateData.name, { lower: true });
            }
            
            return Product.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
        });
        
        const updatedProducts = await Promise.all(updatePromises);
        
        res.status(200).json(
            new ApiResponse(200, updatedProducts, 'Products updated successfully')
        );
    } catch (error) {
        next(error);
    }
};