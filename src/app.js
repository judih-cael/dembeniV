const express = require('express');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const connectDB = require('./config/db');

const app = express();

/* =========================
   DATABASE CONNECTION
========================= */
connectDB();

/* =========================
   SECURITY HEADERS
========================= */
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    })
);

/* =========================
   CORS FINAL (NO "*")
========================= */

const allowedOrigins = [
    'https://dembeni-v-i5sd-hgn26psxy-dembeni.vercel.app'
];

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

/* =========================
   GLOBAL MIDDLEWARES
========================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(mongoSanitize());
app.use(hpp());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

/* =========================
   RATE LIMIT
========================= */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        message: 'Too many requests, try again later.'
    }
});

app.use('/api', apiLimiter);

/* =========================
   STATIC FILES
========================= */
app.use(
    '/public',
    express.static(path.join(__dirname, '..', 'public'))
);

/* =========================
   ROUTES
========================= */
app.use('/api', routes);

/* =========================
   HOME ROUTE
========================= */
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Dembeni API running',
        status: 'OK'
    });
});

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        message: err.message || 'Server error'
    });
});

module.exports = app;