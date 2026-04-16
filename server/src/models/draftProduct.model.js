import mongoose from 'mongoose';

const draftProductSchema = new mongoose.Schema({
    admin_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    mode: {
        type: String,
        required: true,
        enum: ['create', 'edit'],
        index: true
    },
    product_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        default: null,
        index: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    client_id: {
        type: String,
        default: null
    },
    revision: {
        type: Number,
        default: 0
    },
    updated_at: {
        type: Date,
        required: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'db_updated_at' },
    collection: 'draft_products'
});

draftProductSchema.index(
    { admin_id: 1, mode: 1, product_id: 1 },
    { unique: true }
);

draftProductSchema.pre('validate', function (next) {
    if (this.mode === 'edit' && !this.product_id) {
        return next(new Error('product_id is required for edit drafts'));
    }
    if (this.mode === 'create') {
        this.product_id = null;
    }
    next();
});

const DraftProduct = mongoose.model('DraftProduct', draftProductSchema);

export default DraftProduct;
