const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdmin() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'sanchore2026', // <--- Apna MySQL password yahan likhein
            database: 'dkay_test_series' // <--- Jo DB humne banaya tha
        });
        
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await connection.execute(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Admin', 'admin@test.com', hashedPassword, 'admin']
        );
        
        console.log('✅ Admin created successfully!');
        console.log('Email: admin@test.com');
        console.log('Password: admin123');
        
        process.exit();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdmin();