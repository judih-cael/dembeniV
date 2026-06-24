const express = require('express');
const router = express.Router();

// Import individual route files
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const actualiteRoutes = require('./actualiteRoutes');
const evenementRoutes = require('./evenementRoutes');
const serviceRoutes = require('./serviceRoutes');
const demandeRoutes = require('./demandeRoutes');
const contactRoutes = require('./contactRoutes');
const publicationRoutes = require('./publicationRoutes');
const contentSectionRoutes = require('./contentSectionRoutes');
const projetRoutes = require('./projetRoutes');

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// Use routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/actualites', actualiteRoutes);
router.use('/evenements', evenementRoutes);
router.use('/services', serviceRoutes);
router.use('/demandes', demandeRoutes);
router.use('/contact', contactRoutes);
router.use('/publications', publicationRoutes);
router.use('/content-sections', contentSectionRoutes);
router.use('/projets', projetRoutes);

module.exports = router;
