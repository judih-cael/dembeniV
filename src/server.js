require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

// Connect Database
connectDB();

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Serveur actif en mode ${process.env.NODE_ENV} sur le PORT ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
