import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import connectDB from './config/database.js';
import cron from 'node-cron';
import { updateShiprocketOrderStatuses } from './utils/shiprocket.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration with more options
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://yellowtea.in', 'https://admin.yellowtea.in']
    : ['http://localhost:4000', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:5173'];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    }
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
    whitelist: [
        'price', 'rating', 'category', 'type', 'region', 'flush'
    ]
}));

// Compression middleware
app.use(compression());

// Logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    // Use a more concise format for production
    app.use(morgan('combined', {
        skip: (req, res) => res.statusCode < 400 // Only log errors
    }));
}

// Set security headers for API
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// Trust proxy (important for secure cookies and rate limiting behind reverse proxies)
app.set('trust proxy', 1);

// Import routes (to be added)
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import userRoutes from './routes/user.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import qrVideoRoutes from './routes/qrVideo.routes.js';
import adminRoutes from './routes/admin.routes.js';
import impactMetricRoutes from './routes/impactMetric.routes.js';



// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/qr-videos', qrVideoRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/impact-metrics', impactMetricRoutes);



// Health check endpoint
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Welcome route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Yellow Tea API',
        version: '1.0.0',
        documentation: process.env.NODE_ENV === 'production'
            ? 'https://api.yellowtea.in/docs'
            : 'http://localhost:5000/docs'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error:`, err);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? {} : {
            stack: err.stack,
            details: err.details || {}
        }
    });
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint not found: ${req.method} ${req.originalUrl}`
    });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`[${new Date().toISOString()}] Unhandled Rejection:`, err);
    // Close server & exit process gracefully
    server.close(() => {
        console.log('Server closed due to unhandled promise rejection');
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error(`[${new Date().toISOString()}] Uncaught Exception:`, err);
    // Close server & exit process gracefully
    server.close(() => {
        console.log('Server closed due to uncaught exception');
        process.exit(1);
    });
});

// Graceful shutdown on SIGTERM
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

// Schedule Shiprocket tracking updates every 30 minutes
cron.schedule('*/30 * * * *', async () => {
    console.log('Running Shiprocket tracking update cron job...');
    await updateShiprocketOrderStatuses();
});

export default app;