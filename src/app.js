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

// ── Fichiers statiques (AVANT tout le reste — pas besoin de DB) ────────────────
// En local : projet/public/
// Sur Vercel (production) : /tmp/public/ (uploads ephémères)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';

app.use('/public', express.static(path.join(__dirname, '..', 'public'), {
    maxAge: '1d',
    etag: true,
}));

if (isVercel) {
    // Sur Vercel, les uploads vont dans /tmp qui est accessible en écriture
    app.use('/public/uploads', express.static(path.join(os.tmpdir(), 'public', 'uploads')));
}

// ── Connexion DB sur les routes API uniquement ─────────────────────────────────
app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        next(error);
    }
});

// ── Sécurité ───────────────────────────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));

// ── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4000',
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Non autorisé par CORS'));
        }
    },
    credentials: true,
}));

// ── Body parsers ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Correctif req.query (read-only dans Express récent) ────────────────────────
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

// ── Rate Limiting ──────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { message: 'Trop de requêtes effectuées depuis cette IP, veuillez réessayer plus tard.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', apiLimiter);

// ── Routes API ─────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 ────────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
    res.status(404).json({ message: `Route introuvable : ${req.method} ${req.originalUrl}` });
});

// ── Gestionnaire global d'erreurs ─────────────────────────────────────────────
app.use((err, req, res, next) => {
    const statusCode = err.status || (res.statusCode === 200 ? 500 : res.statusCode);
    console.error(`[Error] ${err.message}`, err.stack);
    res.status(statusCode).json({
        message: err.message || 'Une erreur serveur est survenue.',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

module.exports = app;
