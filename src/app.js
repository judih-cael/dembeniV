const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const os = require('os');
const helmet = require('helmet');
const compression = require('compression');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const connectDB = require('./config/db');

const app = express();

// ==============================
// STATIC FILES
// ==============================

const isVercel =
    process.env.VERCEL === '1' ||
    process.env.VERCEL === 'true';

app.use(
    '/public',
    express.static(path.join(__dirname, '..', 'public'), {
        maxAge: '1d',
        etag: true,
    })
);

if (isVercel) {
    app.use(
        '/public/uploads',
        express.static(path.join(os.tmpdir(), 'public', 'uploads'))
    );
}

// ==============================
// DATABASE
// ==============================

app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(error);
    }
});

// ==============================
// SECURITY
// ==============================

app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    })
);

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4000',
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (
                !origin ||
                allowedOrigins.includes(origin) ||
                origin.endsWith('.vercel.app')
            ) {
                callback(null, true);
            } else {
                callback(new Error('Non autorisé par CORS'));
            }
        },
        credentials: true,
    })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
    Object.defineProperty(req, 'query', {
        value: { ...req.query },
        writable: true,
        configurable: true,
        enumerable: true,
    });
    next();
});

app.use(mongoSanitize());
app.use(hpp());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ==============================
// RATE LIMIT
// ==============================

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        message:
            'Trop de requêtes effectuées depuis cette IP, veuillez réessayer plus tard.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', apiLimiter);

// ==============================
// HOME ROUTE
// ==============================

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        application: 'Backend API Dembeni',
        version: '1.0.0',
        status: 'Running',
        api: '/api',
        health: '/api/health',
    });
});

// ==============================
// API ROUTES
// ==============================

app.use('/api', routes);

// ==============================
// 404
// ==============================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route introuvable : ${req.method} ${req.originalUrl}`,
    });
});

// ==============================
// GLOBAL ERROR HANDLER
// ==============================

app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.status || 500).json({
        success: false,
        message:
            err.message ||
            'Une erreur serveur est survenue.',
        stack:
            process.env.NODE_ENV === 'production'
                ? undefined
                : err.stack,
    });
});

module.exports = app;
