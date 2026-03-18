const mysql = require('mysql2');

// Production vs Development detection
const isProduction = process.env.NODE_ENV === 'production';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'testhub',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // SSL configuration for TiDB Cloud
    ssl: isProduction ? {
        rejectUnauthorized: true
    } : false,
    // Enable timezone support
    timezone: '+05:30' // IST
});

module.exports = pool.promise();