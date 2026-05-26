const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'Le prénom est obligatoire']
    },
    lastname: {
        type: String,
        required: [true, 'Le nom est obligatoire']
    },
    email: {
        type: String,
        required: [true, "L'email est obligatoire"],
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est obligatoire']
    },
    role: {
        type: String,
        enum: ['visitor', 'citoyen', 'admin'],
        default: 'visitor'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    address: {
        type: String
    },
    quartier: {
        type: String
    },
    profileImage: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
