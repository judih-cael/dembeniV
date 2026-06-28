const { validationResult, body, param, query } = require('express-validator');

// Reusable validation handler
const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        // Return a professional formatted JSON error response
        return res.status(400).json({
            message: 'Erreur de validation des données fournies.',
            errors: errors.array().map(err => ({
                field: err.path || err.param,
                message: err.msg,
                location: err.location
            }))
        });
    };
};

// Common validation schemas
const authValidators = {
    register: [
        body('email').isEmail().withMessage('Adresse email invalide.').normalizeEmail(),
        body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
        body('firstname').trim().notEmpty().withMessage('Le prénom est requis.'),
        body('lastname').trim().notEmpty().withMessage('Le nom de famille est requis.'),
        body('address').optional().trim(),
        body('phone').optional().trim(),
    ],
    login: [
        body('email').isEmail().withMessage('Adresse email invalide.').normalizeEmail(),
        body('password').notEmpty().withMessage('Le mot de passe est requis.')
    ],
    forgotPassword: [
        body('email').isEmail().withMessage('Adresse email invalide.').normalizeEmail()
    ],
    verifyOtp: [
        body('email').isEmail().withMessage('Adresse email invalide.').normalizeEmail(),
        body('code').isLength({ min: 6, max: 6 }).withMessage('Le code OTP doit être composé de 6 chiffres.')
    ],
    resetPassword: [
        body('email').isEmail().withMessage('Adresse email invalide.').normalizeEmail(),
        body('code').isLength({ min: 6, max: 6 }).withMessage('Le code OTP doit être composé de 6 chiffres.'),
        body('newPassword').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères.')
    ]
};

const demandeValidators = {
    create: [
        body('type').trim().notEmpty().withMessage('Le type de demande est requis.'),
        body('description').trim().notEmpty().withMessage('La description est requise.')
    ]
};

const contactValidators = {
    send: [
        body('name').trim().notEmpty().withMessage('Le nom est requis.'),
        body('email').isEmail().withMessage('Adresse email invalide.').normalizeEmail(),
        body('message').trim().notEmpty().withMessage('Le message est requis.')
    ]
};

module.exports = {
    validate,
    authValidators,
    demandeValidators,
    contactValidators,
    body,
    param,
    query
};
