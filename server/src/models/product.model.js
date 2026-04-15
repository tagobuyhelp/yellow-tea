import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A product must have a name'],
        trim: true,
        maxlength: [100, 'A product name cannot be more than 100 characters']
    },
    subtitle: {
        type: String,
        trim: true,
        maxlength: [200, 'A product subtitle cannot be more than 200 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    category: {
        type: String,
        required: [true, 'A product must have a category'],
        enum: {
            values: ['Trial Pack', 'Gift Box', 'Full Size'],
            message: 'Category must be either: Trial Pack, Gift Box, or Full Size'
        }
    },
    type: {
        type: [String],
        required: [true, 'A product must have at least one type'],
        validate: {
            validator: function (val) {
                return val.length > 0;
            },
            message: 'A product must have at least one type'
        }
    },
    flush: {
        type: String,
        enum: {
            values: ['Spring', 'Summer', 'Autumn', 'Winter', ''],
            message: 'Flush must be either: Spring, Summer, Autumn, or Winter'
        }
    },
    region: String,
    packaging: {
        type: String,
        enum: {
            values: ['Teabags', 'Whole Leaf', ''],
            message: 'Packaging must be either: Teabags or Whole Leaf'
        }
    },
    quantity: String,
    price: {
        type: Number,
        required: [true, 'A product must have a price'],
        min: [0, 'Price must be positive']
    },
    offer: String,
    gift_included: String,
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating must be at least 0'],
        max: [5, 'Rating cannot be more than 5'],
        set: val => Math.round(val * 10) / 10 // Round to 1 decimal place
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: [0, 'Reviews count must be positive']
    },
    badges: [String],
    taste_notes: [String],
    tags: [String],
    images: [String],
    origin: {
        garden_name: String,
        elevation_ft: Number,
        harvest_date: Date
    },
    brewing: {
        temperature_c: {
            type: Number,
            min: [0, 'Temperature must be positive'],
            max: [100, 'Temperature cannot be more than 100°C']
        },
        time_min: {
            type: Number,
            min: [0, 'Brewing time must be positive']
        },
        method: String
    },
    scan_to_brew: {
        video_url: String,
        steps: [String],
        timer_seconds: Number
    },
    qr_code: String
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
productSchema.index({ name: 'text', tags: 'text', taste_notes: 'text' });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ type: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

// Pre-save hook to create slug from name
productSchema.pre('save', function (next) {
    if (!this.isModified('name')) return next();
    this.slug = slugify(this.name, { lower: true });
    next();
});

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function () {
    if (typeof this.price === 'number') {
        return `₹${this.price.toFixed(2)}`;
    }
    return '₹0.00';
});

// Virtual for id field (maps _id to id for frontend compatibility)
productSchema.virtual('id').get(function () {
    return this._id ? this._id.toString() : null;
});

// Static method to get product stats
productSchema.statics.getProductStats = async function () {
    return this.aggregate([
        {
            $group: {
                _id: '$category',
                numProducts: { $sum: 1 },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        }
    ]);
};

const Product = mongoose.model('Product', productSchema);

export default Product;