const express = require('express');
const router = express.Router();
const { 
    getUsers, 
    validateUser, 
    rejectUser, 
    deleteUser, 
    getDemandes, 
    respondToDemande, 
    getStats 
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);
router.use(adminOnly);

// Citizens management
router.get('/users', getUsers);
router.put('/users/:id/validate', validateUser);
router.put('/users/:id/reject', rejectUser);
router.delete('/users/:id', deleteUser);

// Demands management
router.get('/demandes', getDemandes);
router.post('/demandes/:id/respond', respondToDemande);

// Dashboard Statistics
router.get('/stats', getStats);

module.exports = router;
