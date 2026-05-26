const Service = require('../models/Service');
const asyncHandler = require('express-async-handler');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
    const services = await Service.find();
    res.status(200).json({ success: true, data: services });
});

// @desc    Create service
// @route   POST /api/services
// @access  Private/Admin
const createService = asyncHandler(async (req, res) => {
    const { title, desc, fullDesc, icon, img, category, location, hours, phone, email, benefits } = req.body;

    if (!title || !desc || !category) {
        res.status(400);
        throw new Error('Veuillez remplir tous les champs requis');
    }

    const service = await Service.create({
        title,
        desc,
        fullDesc,
        icon: icon || 'Activity',
        img,
        category,
        location,
        hours,
        phone,
        email,
        benefits: benefits || []
    });

    res.status(201).json({ success: true, data: service });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
        res.status(404);
        throw new Error('Service non trouvé');
    }

    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: updated });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
        res.status(404);
        throw new Error('Service non trouvé');
    }

    await service.deleteOne();
    res.status(200).json({ success: true, message: 'Service supprimé' });
});

module.exports = {
    getServices,
    createService,
    updateService,
    deleteService
};
