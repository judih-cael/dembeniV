const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * @desc    Register a new citizen
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
    const { firstname, lastname, email, phone, password, address, quartier, profileImage } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('Un utilisateur avec cet email existe déjà');
    }

    const user = await User.create({
        firstname,
        lastname,
        email,
        phone,
        password,
        address,
        quartier,
        profileImage: profileImage || '',
        role: 'citoyen',
        status: 'pending' // pending until admin validates
    });

    if (user) {
        res.status(201).json({
            success: true,
            message: 'Votre inscription a bien été enregistrée. Votre compte est en attente de validation par l\'administration de Dembéni.',
            data: {
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } else {
        res.status(400);
        throw new Error('Données d\'inscription invalides');
    }
});

/**
 * @desc    Authenticate user & get token (unified)
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        // If user is a citizen, check if status is approved
        if (user.role === 'citoyen' && user.status !== 'approved') {
            if (user.status === 'pending') {
                res.status(401);
                throw new Error('Votre compte est toujours en attente de validation par l\'administration.');
            } else if (user.status === 'rejected') {
                res.status(401);
                throw new Error('Votre demande d\'inscription a été refusée par l\'administration.');
            }
        }

        res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            data: {
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                status: user.status,
                phone: user.phone,
                address: user.address,
                quartier: user.quartier,
                profileImage: user.profileImage,
                token: generateToken(user._id)
            }
        });
    } else {
        res.status(401);
        throw new Error('Identifiants de connexion invalides');
    }
});

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                address: user.address,
                quartier: user.quartier,
                profileImage: user.profileImage
            }
        });
    } else {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }
});

module.exports = {
    registerUser,
    loginUser,
    getUserProfile
};
