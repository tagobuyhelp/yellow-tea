import mongoose from 'mongoose';

const impactMetricSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Impact metric must be associated with a user']
    },
    product_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'Impact metric must be associated with a product']
    },
    cups_served: {
        type: Number,
        default: 0,
        min: [0, 'Cups served cannot be negative']
    },
    children_educated: {
        type: Number,
        default: 0,
        min: [0, 'Children educated cannot be negative']
    },
    plastic_recycled_g: {
        type: Number,
        default: 0,
        min: [0, 'Plastic recycled cannot be negative']
    },
    co2_offset_kg: {
        type: Number,
        default: 0,
        min: [0, 'CO2 offset cannot be negative']
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better query performance
impactMetricSchema.index({ user_id: 1 });
impactMetricSchema.index({ product_id: 1 });

// Static method to get total impact metrics
impactMetricSchema.statics.getTotalImpact = async function() {
    return this.aggregate([
        {
            $group: {
                _id: null,
                totalCupsServed: { $sum: '$cups_served' },
                totalChildrenEducated: { $sum: '$children_educated' },
                totalPlasticRecycled: { $sum: '$plastic_recycled_g' },
                totalCO2Offset: { $sum: '$co2_offset_kg' }
            }
        }
    ]);
};

// Static method to get user's total impact
impactMetricSchema.statics.getUserImpact = async function(userId) {
    return this.aggregate([
        {
            $match: { user_id: mongoose.Types.ObjectId(userId) }
        },
        {
            $group: {
                _id: '$user_id',
                totalCupsServed: { $sum: '$cups_served' },
                totalChildrenEducated: { $sum: '$children_educated' },
                totalPlasticRecycled: { $sum: '$plastic_recycled_g' },
                totalCO2Offset: { $sum: '$co2_offset_kg' }
            }
        }
    ]);
};

const ImpactMetric = mongoose.model('ImpactMetric', impactMetricSchema);

export default ImpactMetric;