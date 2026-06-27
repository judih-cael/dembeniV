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

/* =========================
   DATABASE
========================= */
app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(error);
    }
});

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
   CORS - PRODUCTION FIX 100%
========================= */

const allowedOrigins = [
    'https://dembeni-v-i5sd-hgn26psxy-dembeni.vercel.app'
];

app.use(
    cors({
        origin: function (origin, callback) {
            // allow Postman / server-to-server
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error('Not allowed by CORS'));
        },

        credentials: true,

        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With'
        ]
    })
);

// Handle preflight requests
app.options('*', cors());

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
        message: 'Trop de requêtes, réessayez plus tard.'
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
   HOME ROUTE
========================= */
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Backend API Dembeni running',
        status: 'OK'
    });
});

/* =========================
   ROUTES
========================= */
app.use('/api', routes);

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route introuvable'
    });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
    console.error(err);

    res.status(500).json({
        success: false,
        message: err.message || 'Erreur serveur'
    });
});

module.exports = app;