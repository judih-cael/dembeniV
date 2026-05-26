const mongoose = require('mongoose');

const publicationSchema = mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Veuillez ajouter un titre'] 
    },
    content: { 
        type: String, 
        required: [true, 'Veuillez ajouter un contenu'] 
    },
    type: {
        type: String,
        required: true,
        enum: ['actualite', 'evenement', 'projet', 'annonce', 'information'],
        default: 'actualite'
    },
    category: { 
        type: String, 
        required: true,
        enum: [
            'Santé & Solidarité', 'Environnement', 'Jeunesse', 'Culture', 
            'Sécurité', 'Services publics', 'Vie citoyenne', 'Urbanisme', 
            'Éducation', 'Développement local', 'Général'
        ],
        default: 'Général'
    },
    image: { 
        type: String, 
        default: 'https://images.unsplash.com/photo-1541888062862-23f2ec4da240?auto=format&fit=crop&w=800&q=80' 
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published'
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isUrgent: {
        type: Boolean,
        default: false
    },
    showOnHomepage: {
        type: Boolean,
        default: false
    },
    secondaryCategories: [{
        type: String,
        enum: [
            'Santé & Solidarité', 'Environnement', 'Jeunesse', 'Culture', 
            'Sécurité', 'Services publics', 'Vie citoyenne', 'Urbanisme', 
            'Éducation', 'Développement local', 'Général'
        ]
    }],
    tags: [{
        type: String
    }],
    eventDate: {
        type: Date
    },
    eventLocation: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Publication', publicationSchema);
