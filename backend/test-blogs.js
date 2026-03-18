const mysql = require('mysql2/promise');

async function testBlogs() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'your_password',
        database: 'test_series_db'
    });

    // Check all blogs
    const [blogs] = await connection.query('SELECT * FROM blogs');
    console.log('All blogs:', blogs);

    // Check published blogs
    const [published] = await connection.query(
        'SELECT * FROM blogs WHERE status = ?',
        ['published']
    );
    console.log('Published blogs:', published);

    process.exit();
}

testBlogs();