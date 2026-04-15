import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const addressSchema = new mongoose.Schema({
    line1: {
        type: String,
        required: [true, 'Address line is required']
    },
    city: {
        type: String,
        required: [true, 'City is required']
    },
    state: {
        type: String,
        required: [true, 'State is required']
    },
    pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        validate: {
            validator: function (val) {
                return /^\d{6}$/.test(val); // Indian pincode validation
            },
            message: 'Please provide a valid 6-digit pincode'
        }
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        default: 'India'
    }
}, {
    _id: true
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (val) {
                return /^\S+@\S+\.\S+$/.test(val);
            },
            message: 'Please provide a valid email address'
        }
    },
    phone: {
        type: String,
        validate: {
            validator: function (val) {
                return /^\d{10}$/.test(val); // Simple validation for 10-digit Indian phone numbers
            },
            message: 'Please provide a valid 10-digit phone number'
        }
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: function (val) {
                return !val || /^\d{10}$/.test(val); // Optional, but if present must be 10 digits
            },
            message: 'Please provide a valid 10-digit phone number'
        }
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false // Don't include password in query results by default
    },
    
    role: {
        type: String,
        enum: {
            values: ['customer', 'admin'],
            message: 'Role must be either: customer or admin'
        },
        default: 'customer'
    },
    wishlist: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Product'
    }],
    addresses: [addressSchema],
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
    // Only run this function if password was modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;

    // Update passwordChangedAt if not a new user
    if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change
    }

    next();
});

// Pre-query middleware to filter out inactive users
userSchema.pre(/^find/, function (next) {
    // 'this' points to the current query
    this.find({ active: { $ne: false } });
    next();
});

// Instance method to check if password is correct
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Alias for controller compatibility
userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
    // 'this' is the user document, password is not selected by default
    return await this.correctPassword(candidatePassword, this.password);
};

// Instance method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
};

// Instance method to generate password reset token
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

// Instance method to generate email verification token
userSchema.methods.createEmailVerificationToken = function () {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return verificationToken;
};

// Instance method to add product to wishlist
userSchema.methods.addToWishlist = function (productId) {
    if (!this.wishlist.includes(productId)) {
        this.wishlist.push(productId);
    }
    return this.save();
};

// Instance method to remove product from wishlist
userSchema.methods.removeFromWishlist = function (productId) {
    this.wishlist = this.wishlist.filter(id => id.toString() !== productId.toString());
    return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;