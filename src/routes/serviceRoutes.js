const express = require('express');
const router = express.Router();
const { getServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
    .get(getServices)
    .post(protect, adminOnly, createService);

router.route('/:id')
    .put(protect, adminOnly, updateService)
    .delete(protect, adminOnly, deleteService);

module.exports = router;
