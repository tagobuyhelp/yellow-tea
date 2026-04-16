import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection options
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true, // Build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
};

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, options);

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        try {
            const adminEmail = process.env.ADMIN_EMAIL?.trim();
            const adminPassword = process.env.ADMIN_PASSWORD;
            const adminName = process.env.ADMIN_NAME?.trim() || 'Administrator';

            if (adminEmail && adminPassword) {
                const { default: User } = await import('../models/user.model.js');

                const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() }).select('_id role');

                if (!existingAdmin) {
                    await User.create({
                        name: adminName,
                        email: adminEmail.toLowerCase(),
                        password: adminPassword,
                        role: 'admin',
                        isEmailVerified: true
                    });
                    console.log('Default admin user created');
                } else if (existingAdmin.role !== 'admin') {
                    existingAdmin.role = 'admin';
                    await existingAdmin.save({ validateBeforeSave: false });
                    console.log('Default admin user role updated to admin');
                }
            }
        } catch (error) {
            console.error(`Error ensuring default admin user: ${error.message}`);
        }

        // Handle connection events
        mongoose.connection.on('error', err => {
            console.error(`MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // If Node process ends, close the MongoDB connection
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

        return conn;
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
