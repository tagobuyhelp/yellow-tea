import express from 'express';
import multer from 'multer';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';
import { ApiError } from '../utils/apiError.js';

// Import controllers
import {
    createQRVideo,
    getAllQRVideos,
    getQRVideoById,
    getQRVideoByProductSlug,
    updateQRVideo,
    deleteQRVideo,
    uploadVideo,
    uploadThumbnail,
    toggleQRVideoStatus,
    getActiveQRVideos,
    batchUpdateQRVideos,
    generateMissingQRCodes,
    getQRVideoStats,
    scanQRCode,
    regenerateQRCode
} from '../controllers/qrVideo.controller.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'video') {
            // Accept only video files for video field
            if (file.mimetype.startsWith('video/')) {
                cb(null, true);
            } else {
                cb(new ApiError(400, 'Only video files are allowed for video uploads'), false);
            }
        } else if (file.fieldname === 'thumbnail') {
            // Accept only image files for thumbnail field
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new ApiError(400, 'Only image files are allowed for thumbnails'), false);
            }
        } else {
            cb(null, true);
        }
    }
});

// Public routes
router.get('/product/:slug', getQRVideoByProductSlug);
router.get('/active', getActiveQRVideos);
router.get('/scan/:slug', scanQRCode);

// Protected routes (admin only)
router.use(isAuthenticated);

// Routes that require admin privileges
router.use(restrictTo('admin'));

// QR video management routes
router.route('/')
    .get(getAllQRVideos)
    .post(createQRVideo);

router.route('/stats')
    .get(getQRVideoStats);

router.route('/batch')
    .post(batchUpdateQRVideos);

router.route('/generate-missing')
    .post(generateMissingQRCodes);

router.route('/upload-video')
    .post(upload.single('video'), uploadVideo);

router.route('/upload-thumbnail')
    .post(upload.single('thumbnail'), uploadThumbnail);

router.route('/:id')
    .get(getQRVideoById)
    .put(updateQRVideo)
    .delete(deleteQRVideo);

router.route('/:id/toggle-status')
    .patch(toggleQRVideoStatus);

router.route('/:id/regenerate-qr')
    .post(regenerateQRCode);

export default router;