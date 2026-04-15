import mongoose from 'mongoose';
import ImpactMetric from '../models/impactMetric.model.js';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';


/**
 * @desc    Create new impact metric
 * @route   POST /api/v1/impact-metrics
 * @access  Private/Admin
 */
export const createImpactMetric = async (req, res, next) => {
    try {
        const { 
            user_id, 
            product_id, 
            cups_served, 
            children_educated, 
            plastic_recycled_g, 
            co2_offset_kg 
        } = req.body;

        // Validate user exists
        const userExists = await User.findById(user_id);
        if (!userExists) {
            return next(new ApiError(404, 'User not found'));
        }

        // Validate product exists
        const productExists = await Product.findById(product_id);
        if (!productExists) {
            return next(new ApiError(404, 'Product not found'));
        }

        // Create new impact metric
        const impactMetric = await ImpactMetric.create({
            user_id,
            product_id,
            cups_served,
            children_educated,
            plastic_recycled_g,
            co2_offset_kg
        });

        res.status(201).json(
            new ApiResponse(201, impactMetric, 'Impact metric created successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all impact metrics
 * @route   GET /api/v1/impact-metrics
 * @access  Private/Admin
 */
export const getAllImpactMetrics = async (req, res, next) => {
    try {
        // Build query
        const queryObj = { ...req.query };
        
        // Fields to exclude from filtering
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(field => delete queryObj[field]);

        // Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `${match}`);
        
        let query = ImpactMetric.find(JSON.parse(queryStr))
            .populate('user_id', 'name email')
            .populate('product_id', 'name slug');

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-created_at');
        }

        // Field limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        // Execute query
        const impactMetrics = await query;
        
        // Get total count for pagination
        const total = await ImpactMetric.countDocuments(JSON.parse(queryStr));

        res.status(200).json(
            new ApiResponse(200, {
                impactMetrics,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            }, 'Impact metrics retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get impact metric by ID
 * @route   GET /api/v1/impact-metrics/:id
 * @access  Private/Admin
 */
export const getImpactMetricById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const impactMetric = await ImpactMetric.findById(id)
            .populate('user_id', 'name email')
            .populate('product_id', 'name slug');

        if (!impactMetric) {
            return next(new ApiError(404, 'Impact metric not found'));
        }

        res.status(200).json(
            new ApiResponse(200, impactMetric, 'Impact metric retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update impact metric
 * @route   PUT /api/v1/impact-metrics/:id
 * @access  Private/Admin
 */
export const updateImpactMetric = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // If user_id is provided, validate user exists
        if (updateData.user_id) {
            const userExists = await User.findById(updateData.user_id);
            if (!userExists) {
                return next(new ApiError(404, 'User not found'));
            }
        }

        // If product_id is provided, validate product exists
        if (updateData.product_id) {
            const productExists = await Product.findById(updateData.product_id);
            if (!productExists) {
                return next(new ApiError(404, 'Product not found'));
            }
        }

        const impactMetric = await ImpactMetric.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!impactMetric) {
            return next(new ApiError(404, 'Impact metric not found'));
        }

        res.status(200).json(
            new ApiResponse(200, impactMetric, 'Impact metric updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete impact metric
 * @route   DELETE /api/v1/impact-metrics/:id
 * @access  Private/Admin
 */
export const deleteImpactMetric = async (req, res, next) => {
    try {
        const { id } = req.params;

        const impactMetric = await ImpactMetric.findByIdAndDelete(id);

        if (!impactMetric) {
            return next(new ApiError(404, 'Impact metric not found'));
        }

        res.status(200).json(
            new ApiResponse(200, null, 'Impact metric deleted successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get total impact metrics
 * @route   GET /api/v1/impact-metrics/total
 * @access  Public
 */
export const getTotalImpact = async (req, res, next) => {
    try {
        const totalImpact = await ImpactMetric.getTotalImpact();

        res.status(200).json(
            new ApiResponse(200, totalImpact[0] || {
                totalCupsServed: 0,
                totalChildrenEducated: 0,
                totalPlasticRecycled: 0,
                totalCO2Offset: 0
            }, 'Total impact metrics retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user's impact metrics
 * @route   GET /api/v1/impact-metrics/user/:userId
 * @access  Private
 */
export const getUserImpact = async (req, res, next) => {
    try {
        const { userId } = req.params;
        
        // Check if user exists
        const userExists = await User.findById(userId);
        if (!userExists) {
            return next(new ApiError(404, 'User not found'));
        }

        // Check if requesting user is the same as the user being queried or is admin
        if (req.user.id !== userId && req.user.role !== 'admin') {
            return next(new ApiError(403, 'You can only access your own impact metrics'));
        }

        const userImpact = await ImpactMetric.getUserImpact(userId);

        // Get detailed impact metrics with product information
        const detailedImpact = await ImpactMetric.find({ user_id: userId })
            .populate('product_id', 'name slug images')
            .sort('-created_at');

        res.status(200).json(
            new ApiResponse(200, {
                summary: userImpact[0] || {
                    totalCupsServed: 0,
                    totalChildrenEducated: 0,
                    totalPlasticRecycled: 0,
                    totalCO2Offset: 0
                },
                details: detailedImpact
            }, 'User impact metrics retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get product's impact metrics
 * @route   GET /api/v1/impact-metrics/product/:productId
 * @access  Public
 */
export const getProductImpact = async (req, res, next) => {
    try {
        const { productId } = req.params;
        
        // Check if product exists
        const productExists = await Product.findById(productId);
        if (!productExists) {
            return next(new ApiError(404, 'Product not found'));
        }

        // Get product's total impact
        const productImpact = await ImpactMetric.aggregate([
            {
                $match: { product_id: mongoose.Types.ObjectId(productId) }
            },
            {
                $group: {
                    _id: '$product_id',
                    totalCupsServed: { $sum: '$cups_served' },
                    totalChildrenEducated: { $sum: '$children_educated' },
                    totalPlasticRecycled: { $sum: '$plastic_recycled_g' },
                    totalCO2Offset: { $sum: '$co2_offset_kg' }
                }
            }
        ]);

        res.status(200).json(
            new ApiResponse(200, productImpact[0] || {
                totalCupsServed: 0,
                totalChildrenEducated: 0,
                totalPlasticRecycled: 0,
                totalCO2Offset: 0
            }, 'Product impact metrics retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get impact metrics dashboard data
 * @route   GET /api/v1/impact-metrics/dashboard
 * @access  Public
 */
export const getImpactDashboard = async (req, res, next) => {
    try {
        // Get total impact
        const totalImpact = await ImpactMetric.getTotalImpact();
        
        // Get monthly impact for the past year
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyImpact = await ImpactMetric.aggregate([
            {
                $match: {
                    created_at: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$created_at' },
                        month: { $month: '$created_at' }
                    },
                    totalCupsServed: { $sum: '$cups_served' },
                    totalChildrenEducated: { $sum: '$children_educated' },
                    totalPlasticRecycled: { $sum: '$plastic_recycled_g' },
                    totalCO2Offset: { $sum: '$co2_offset_kg' }
                }
            },
            {
                $sort: {
                    '_id.year': 1,
                    '_id.month': 1
                }
            }
        ]);

        res.status(200).json(
            new ApiResponse(200, {
                totalImpact: totalImpact[0] || {
                    totalCupsServed: 0,
                    totalChildrenEducated: 0,
                    totalPlasticRecycled: 0,
                    totalCO2Offset: 0
                },
                monthlyImpact
            }, 'Impact metrics dashboard data retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};


/**
 * @desc    Batch update impact metrics
 * @route   POST /api/v1/impact-metrics/batch
 * @access  Private/Admin
 */
export const batchUpdateImpactMetrics = async (req, res, next) => {
    try {
        const { metrics } = req.body;
        
        if (!Array.isArray(metrics) || metrics.length === 0) {
            return next(new ApiError(400, 'Please provide an array of metrics to update'));
        }
        
        const operations = metrics.map(metric => {
            return {
                updateOne: {
                    filter: { _id: metric._id },
                    update: {
                        $set: {
                            cups_served: metric.cups_served,
                            children_educated: metric.children_educated,
                            plastic_recycled_g: metric.plastic_recycled_g,
                            co2_offset_kg: metric.co2_offset_kg
                        }
                    }
                }
            };
        });
        
        const result = await ImpactMetric.bulkWrite(operations);
        
        res.status(200).json(
            new ApiResponse(200, result, 'Impact metrics batch updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Generate impact report
 * @route   GET /api/v1/impact-metrics/report
 * @access  Private/Admin
 */
export const generateImpactReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        
        // Validate date range
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return next(new ApiError(400, 'Invalid date format. Please use YYYY-MM-DD'));
        }
        
        // Set end date to end of day
        end.setHours(23, 59, 59, 999);
        
        // Get impact metrics within date range
        const impactData = await ImpactMetric.aggregate([
            {
                $match: {
                    created_at: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCupsServed: { $sum: '$cups_served' },
                    totalChildrenEducated: { $sum: '$children_educated' },
                    totalPlasticRecycled: { $sum: '$plastic_recycled_g' },
                    totalCO2Offset: { $sum: '$co2_offset_kg' },
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Get product breakdown
        const productBreakdown = await ImpactMetric.aggregate([
            {
                $match: {
                    created_at: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: '$product_id',
                    totalCupsServed: { $sum: '$cups_served' },
                    totalChildrenEducated: { $sum: '$children_educated' },
                    totalPlasticRecycled: { $sum: '$plastic_recycled_g' },
                    totalCO2Offset: { $sum: '$co2_offset_kg' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);
        
        // Populate product details
        const populatedProductBreakdown = await Promise.all(
            productBreakdown.map(async (item) => {
                const product = await Product.findById(item._id, 'name slug');
                return {
                    ...item,
                    product: product || { name: 'Unknown Product', slug: 'unknown' }
                };
            })
        );
        
        res.status(200).json(
            new ApiResponse(200, {
                dateRange: {
                    start,
                    end
                },
                summary: impactData[0] || {
                    totalCupsServed: 0,
                    totalChildrenEducated: 0,
                    totalPlasticRecycled: 0,
                    totalCO2Offset: 0,
                    count: 0
                },
                productBreakdown: populatedProductBreakdown
            }, 'Impact report generated successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Calculate environmental savings
 * @route   GET /api/v1/impact-metrics/environmental-savings
 * @access  Public
 */
export const calculateEnvironmentalSavings = async (req, res, next) => {
    try {
        // Get total impact metrics
        const totalImpact = await ImpactMetric.getTotalImpact();
        
        // Calculate environmental savings based on impact metrics
        // These are example conversion factors - adjust based on actual data
        const environmentalSavings = {
            waterSavedLiters: (totalImpact[0]?.totalCupsServed || 0) * 2.5, // 2.5L water saved per cup
            co2OffsetKg: totalImpact[0]?.totalCO2Offset || 0,
            plasticSavedKg: (totalImpact[0]?.totalPlasticRecycled || 0) / 1000, // Convert g to kg
            treesPlanted: Math.floor((totalImpact[0]?.totalCO2Offset || 0) / 20), // 20kg CO2 per tree per year
            equivalentCarKm: ((totalImpact[0]?.totalCO2Offset || 0) * 4), // 0.25kg CO2 per km
        };
        
        res.status(200).json(
            new ApiResponse(200, environmentalSavings, 'Environmental savings calculated successfully')
        );
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get regional impact distribution
 * @route   GET /api/v1/impact-metrics/regional-distribution
 * @access  Private/Admin
 */
export const getRegionalDistribution = async (req, res, next) => {
    try {
        // This assumes you have user location data
        const regionalDistribution = await User.aggregate([
            {
                $lookup: {
                    from: 'impactmetrics',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'impact'
                }
            },
            {
                $unwind: '$impact'
            },
            {
                $group: {
                    _id: '$country',
                    totalCupsServed: { $sum: '$impact.cups_served' },
                    totalChildrenEducated: { $sum: '$impact.children_educated' },
                    totalPlasticRecycled: { $sum: '$impact.plastic_recycled_g' },
                    totalCO2Offset: { $sum: '$impact.co2_offset_kg' },
                    userCount: { $addToSet: '$_id' }
                }
            },
            {
                $project: {
                    country: '$_id',
                    totalCupsServed: 1,
                    totalChildrenEducated: 1,
                    totalPlasticRecycled: 1,
                    totalCO2Offset: 1,
                    userCount: { $size: '$userCount' }
                }
            },
            {
                $sort: { userCount: -1 }
            }
        ]);
        
        res.status(200).json(
            new ApiResponse(200, regionalDistribution, 'Regional impact distribution retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};