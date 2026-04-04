const mysql = require('mysql2');

// Check karein ki hum production (TiDB) mein hain ya localhost mein
const isProduction = process.env.NODE_ENV === 'production';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'sanchore2026',
    database: process.env.DB_NAME || 'test_series_new',
    port: parseInt(process.env.DB_PORT) || 3306, // Local default 3306, TiDB default 4000
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    // ✅ SSL sirf tab chalega jab hum production/online honge
    ssl: isProduction ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    } : null 
};

console.log(`🔌 Connecting to: ${dbConfig.host} | SSL: ${isProduction ? 'ON' : 'OFF'}`);

const pool = mysql.createPool(dbConfig);

// Connection check
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ DB Connection Error:', err.message);
    } else {
        console.log('✅ Database connected successfully');
        connection.release();
    }
});

module.exports = pool.promise();