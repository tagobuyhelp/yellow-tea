import express from 'express';
import {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getProductCategories,
    getProductTypes,
    getTopRatedProducts,
    getProductsByBadge,
    getRelatedProducts,
    getProductsByRegion,
    getProductsByFlush,
    getProductsByPriceRange,
    getProductStats,
    updateProductImages,
    removeProductImage,
    getNewArrivals,
    getProductsByTasteNote,
    bulkUpdateProducts
} from '../controllers/product.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Public routes
router.get('/', getAllProducts);
router.get('/categories', getProductCategories);
router.get('/types', getProductTypes);
router.get('/top-rated', getTopRatedProducts);
router.get('/badge/:badge', getProductsByBadge);
router.get('/region/:region', getProductsByRegion);
router.get('/flush/:flush', getProductsByFlush);
router.get('/price-range', getProductsByPriceRange);
router.get('/new-arrivals', getNewArrivals);
router.get('/taste/:note', getProductsByTasteNote);
router.get('/:id/related', getRelatedProducts);
router.get('/:id', getProduct);

// Protected routes - Admin only
router.use(isAuthenticated, restrictTo('admin', 'super-admin'));

router.post('/', upload.array('images', 10), createProduct);
router.put('/:id', upload.array('images', 10), updateProduct);
router.delete('/:id', deleteProduct);
router.get('/admin/stats', getProductStats);
router.put('/:id/images', upload.array('images', 10), updateProductImages);
router.delete('/:id/images', removeProductImage);
router.patch('/bulk-update', bulkUpdateProducts);

export default router;