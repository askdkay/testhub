const fs = require('fs');
const path = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'dksql',
    database: process.env.DB_NAME || 'test_series_db',
    multipleStatements: true
};
// Keep-alive endpoint
app.get('/ping', (req, res) => {
    res.json({ pong: true, timestamp: new Date() });
});

// Auto ping every 10 minutes (self ping)
if (process.env.NODE_ENV === 'production') {
    setInterval(async () => {
        try {
            await fetch(`http://localhost:${PORT}/ping`);
            console.log('Keep-alive ping sent');
        } catch (e) {
            console.log('Ping failed');
        }
    }, 10 * 60 * 1000); // 10 minutes
}
// Function to create slug from title
function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Function to parse and insert JSON data
async function parseAndInsert(jsonFilePath) {
    let connection;
    try {
        // Read JSON file
        console.log(`📖 Reading file: ${jsonFilePath}`);
        const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
        const data = JSON.parse(jsonData);

        console.log('✅ JSON parsed successfully');
        console.log('📦 Data:', JSON.stringify(data, null, 2).substring(0, 200) + '...');

        // Connect to database
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Check if exam_categories table exists, create if not
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS exam_categories (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                icon VARCHAR(50),
                is_active BOOLEAN DEFAULT true
            )
        `);

        // Check if exam_content table exists, create if not
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS exam_content (
                id INT PRIMARY KEY AUTO_INCREMENT,
                exam_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                content LONGTEXT NOT NULL,
                summary TEXT,
                featured_image VARCHAR(500),
                category VARCHAR(100),
                tags JSON,
                author_id INT DEFAULT 1,
                views INT DEFAULT 0,
                status ENUM('draft', 'published', 'archived') DEFAULT 'published',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                published_at TIMESTAMP NULL,
                FOREIGN KEY (exam_id) REFERENCES exam_categories(id) ON DELETE CASCADE
            )
        `);

        // Insert exam category if not exists
        const examName = data.exam_name || 'Rajasthan CET';
        const examSlug = createSlug(examName);
        
        let examId = data.exam_id;
        
        if (!examId) {
            // Check if exam exists
            const [existingExam] = await connection.execute(
                'SELECT id FROM exam_categories WHERE slug = ?',
                [examSlug]
            );

            if (existingExam.length > 0) {
                examId = existingExam[0].id;
                console.log(`✅ Exam found: ${examName} (ID: ${examId})`);
            } else {
                // Insert new exam
                const [result] = await connection.execute(
                    'INSERT INTO exam_categories (name, slug, description, icon) VALUES (?, ?, ?, ?)',
                    [examName, examSlug, `Study material for ${examName}`, '📚']
                );
                examId = result.insertId;
                console.log(`✅ New exam created: ${examName} (ID: ${examId})`);
            }
        }

        // Create slug from title
        const slug = createSlug(data.title);

        // Check if content already exists
        const [existingContent] = await connection.execute(
            'SELECT id FROM exam_content WHERE slug = ?',
            [slug]
        );

        let finalSlug = slug;
        if (existingContent.length > 0) {
            finalSlug = `${slug}-${Date.now()}`;
            console.log(`⚠️ Slug already exists, using: ${finalSlug}`);
        }

        // Prepare tags
        const tags = data.tags || [];

        // Insert content
        const [result] = await connection.execute(
            `INSERT INTO exam_content (
                exam_id, title, slug, content, summary, 
                featured_image, category, tags, status, published_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                examId,
                data.title,
                finalSlug,
                data.content,
                data.summary || data.content.substring(0, 200),
                data.featured_image || null,
                data.category || 'General',
                JSON.stringify(tags),
                'published'
            ]
        );

        console.log('\n✅✅✅ CONTENT ADDED SUCCESSFULLY ✅✅✅');
        console.log('📝 Title:', data.title);
        console.log('🔗 Slug:', finalSlug);
        console.log('🆔 Content ID:', result.insertId);
        console.log('📂 Exam ID:', examId);
        console.log('🏷️ Category:', data.category || 'General');
        console.log('🔖 Tags:', tags.join(', ') || 'None');
        console.log('\n📊 You can view it at:');
        console.log(`👉 http://localhost:3000/exam/${examSlug}/study`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log('\n💡 Tip: Make sure database tables exist. Run: node migrate.js');
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('👋 Database connection closed');
        }
    }
}

// Get file path from command line argument
const filePath = process.argv[2];

if (!filePath) {
    console.log('❌ Please provide a JSON file path');
    console.log('\n📌 Usage: node parser.js <json-file-path>');
    console.log('📌 Example: node parser.js ./rajasthan-cet-human-rights.json');
    process.exit(1);
}

// Check if file exists
if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    process.exit(1);
}

// Run the parser
parseAndInsert(filePath);