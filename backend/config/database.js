const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// TiDB Cloud requires SSL connection
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 4000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // ✅ CRITICAL: SSL configuration for TiDB Cloud
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
};

console.log('🔌 Connecting to TiDB Cloud with SSL...');
console.log(`📊 Host: ${dbConfig.host}:${dbConfig.port}`);
console.log(`📊 Database: ${dbConfig.database}`);
console.log(`📊 User: ${dbConfig.user}`);
console.log(`🔒 SSL: Enabled`);

const pool = mysql.createPool(dbConfig);

// Test connection immediately
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ DATABASE CONNECTION FAILED:');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
        console.error('');
        console.error('Possible solutions:');
        console.error('1. Check TiDB Cloud IP Access List - add 0.0.0.0/0');
        console.error('2. Verify DB_HOST, DB_USER, DB_PASSWORD are correct');
        console.error('3. Ensure TiDB Cloud cluster is active');
    } else {
        console.log('✅ Database connected successfully to TiDB Cloud');
        connection.release();
    }
});

module.exports = pool.promise();