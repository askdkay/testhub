const mysql = require('mysql2');

// Log connection attempt
console.log('🔌 Attempting database connection...');
console.log('📊 DB Config:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: true
});

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 4000,
    waitForConnections: true,
    connectionLimit: 3,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false  // Try with false first for debugging
    },
    connectTimeout: 30000,
    enableKeepAlive: true
});

// Test connection immediately
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ DATABASE CONNECTION FAILED:');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
        console.error('Check:');
        console.error('1. DB_HOST is correct -', process.env.DB_HOST);
        console.error('2. DB_USER is correct -', process.env.DB_USER);
        console.error('3. DB_PASSWORD is correct');
        console.error('4. TiDB Cloud allows IP - add 0.0.0.0/0 to IP Access List');
        console.error('5. Network connectivity - Render can reach TiDB');
    } else {
        console.log('✅ Database connected successfully');
        connection.release();
    }
});

module.exports = pool.promise();