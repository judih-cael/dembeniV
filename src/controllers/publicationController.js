const asyncHandler = require('express-async-handler');
const Publication = require('../models/Publication');

// @desc    Get all publications (with optional filters)
// @route   GET /api/publications
// @access  Public
const getPublications = asyncHandler(async (req, res) => {
    const { type, category, status, isFeatured, isPinned, limit } = req.query;
    
    let query = {};
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    else if (!req.user || req.user.role !== 'admin') {
        // By default, public users only see published content
        query.status = 'published';
    }
    if (isFeatured) query.isFeatured = isFeatured === 'true';
    if (isPinned) query.isPinned = isPinned === 'true';

    let mongooseQuery = Publication.find(query).sort({ createdAt: -1 });
    
    if (limit) {
        mongooseQuery = mongooseQuery.limit(Number(limit));
    }

    const publications = await mongooseQuery;

    res.status(200).json({
        success: true,
        count: publications.length,
        data: publications
    });
});

// @desc    Get single publication
// @route   GET /api/publications/:id
// @access  Public
const getPublicationById = asyncHandler(async (req, res) => {
    const publication = await Publication.findById(req.params.id);

    if (!publication) {
        res.status(404);
        throw new Error('Publication introuvable');
    }

    // If it's a draft, only admin can see it
    if (publication.status === 'draft') {
        if (!req.user || req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Accès non autorisé');
        }
    }

    res.status(200).json({
        success: true,
        data: publication
    });
});

// @desc    Create new publication
// @route   POST /api/publications
// @access  Private/Admin
const createPublication = asyncHandler(async (req, res) => {
    // Add user to req.body
    req.body.author = req.user.id;

    const publication = await Publication.create(req.body);

    res.status(201).json({
        success: true,
        data: publication
    });
});

// @desc    Update publication
// @route   PUT /api/publications/:id
// @access  Private/Admin
const updatePublication = asyncHandler(async (req, res) => {
    let publication = await Publication.findById(req.params.id);

    if (!publication) {
        res.status(404);
        throw new Error('Publication introuvable');
    }

    publication = await Publication.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: publication
    });
});

// @desc    Delete publication
// @route   DELETE /api/publications/:id
// @access  Private/Admin
const deletePublication = asyncHandler(async (req, res) => {
    const publication = await Publication.findById(req.params.id);

    if (!publication) {
        res.status(404);
        throw new Error('Publication introuvable');
    }

    await publication.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

module.exports = {
    getPublications,
    getPublicationById,
    createPublication,
    updatePublication,
    deletePublication
};
