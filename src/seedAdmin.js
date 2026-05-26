require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('🔄 Initialisation du compte Administrateur...');
        
        // Remove old admins if any to avoid duplication
        const adminExists = await User.findOne({ email: 'judih@cael.com' });

        if (!adminExists) {
            await User.create({
                firstname: 'Judih',
                lastname: 'Cael',
                email: 'judih@cael.com',
                password: 'cael2305!',
                phone: '0338012708',
                address: 'Administration Centrale de Dembéni',
                quartier: 'Tsararano',
                role: 'admin',
                status: 'approved'
            });
            console.log('✅ Compte Administrateur (judih@cael.com / cael2305!) créé dans la collection User.');
        } else {
            // Update to ensure correct unified fields
            adminExists.role = 'admin';
            adminExists.status = 'approved';
            adminExists.firstname = 'Judih';
            adminExists.lastname = 'Cael';
            await adminExists.save();
            console.log('✅ Le compte Administrateur existe déjà dans la collection User et a été mis à jour.');
        }

        process.exit();
    } catch (error) {
        console.error(`❌ Erreur seeder admin : ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
