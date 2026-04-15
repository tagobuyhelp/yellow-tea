import mongoose from 'mongoose';

const adminLogSchema = new mongoose.Schema({
    admin_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Admin log must be associated with an admin user']
    },
    action_type: {
        type: String,
        required: [true, 'Action type is required'],
        enum: [
            'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT',
            'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
            'UPDATE_ORDER', 'DELETE_ORDER',
            'SYSTEM_CONFIG', 'LOGIN', 'LOGOUT',
            'OTHER'
        ]
    },
    target_collection: {
        type: String,
        required: [true, 'Target collection is required'],
        enum: ['products', 'users', 'orders', 'system', 'auth', 'other']
    },
    target_id: mongoose.Schema.ObjectId,
    details: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Log details are required']
    },
    ip_address: String,
    user_agent: String
}, {
    timestamps: { createdAt: 'timestamp' }
});

// Indexes for better query performance
adminLogSchema.index({ admin_id: 1, timestamp: -1 });
adminLogSchema.index({ action_type: 1 });
adminLogSchema.index({ target_collection: 1 });
adminLogSchema.index({ timestamp: -1 });

// Static method to get logs by admin
adminLogSchema.statics.getLogsByAdmin = async function(adminId, limit = 100) {
    return this.find({ admin_id: adminId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .exec();
};

// Static method to get logs by action type
adminLogSchema.statics.getLogsByActionType = async function(actionType, limit = 100) {
    return this.find({ action_type: actionType })
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('admin_id', 'name email')
        .exec();
};

// Static method to get logs by target collection
adminLogSchema.statics.getLogsByCollection = async function(collection, limit = 100) {
    return this.find({ target_collection: collection })
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('admin_id', 'name email')
        .exec();
};

// Static method to get logs by target ID
adminLogSchema.statics.getLogsByTargetId = async function(targetId, limit = 100) {
    return this.find({ target_id: targetId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('admin_id', 'name email')
        .exec();
};

// Static method to get logs within a date range
adminLogSchema.statics.getLogsByDateRange = async function(startDate, endDate, limit = 100) {
    return this.find({
        timestamp: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    })
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('admin_id', 'name email')
        .exec();
};

// Static method to get activity summary
adminLogSchema.statics.getActivitySummary = async function(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.aggregate([
        {
            $match: {
                timestamp: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    action: '$action_type',
                    day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.day': 1, '_id.action': 1 }
        }
    ]);
};

// Static method to create a new log entry
adminLogSchema.statics.createLog = async function(adminId, actionType, targetCollection, targetId, details, req) {
    const logEntry = {
        admin_id: adminId,
        action_type: actionType,
        target_collection: targetCollection,
        target_id: targetId,
        details: details
    };
    
    // Add IP and user agent if request object is provided
    if (req) {
        logEntry.ip_address = req.ip || req.connection.remoteAddress;
        logEntry.user_agent = req.headers['user-agent'];
    }
    
    return this.create(logEntry);
};

const AdminLog = mongoose.model('AdminLog', adminLogSchema);

export default AdminLog;