const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

// Get all topics and subtopics for an exam
router.get('/exam/:examSlug/content', async (req, res) => {
    try {
        const { examSlug } = req.params;
        
        const [exam] = await db.query('SELECT id FROM exams WHERE slug = ?', [examSlug]);
        if (exam.length === 0) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        const examId = exam[0].id;
        
        const [topics] = await db.query(`
            SELECT * FROM exam_topics 
            WHERE exam_id = ? 
            ORDER BY display_order
        `, [examId]);
        
        const [subtopics] = await db.query(`
            SELECT * FROM exam_subtopics 
            WHERE exam_id = ? AND status = 'published'
            ORDER BY display_order
        `, [examId]);
        
        const groupedData = topics.map(topic => ({
            ...topic,
            subtopics: subtopics.filter(st => st.topic_id === topic.id)
        }));
        
        res.json(groupedData);
        
    } catch (error) {
        console.error('Error fetching exam content:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/content/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        const [subtopics] = await db.query(`
            SELECT s.*, t.name as topic_name, e.name as exam_name, e.slug as exam_slug
            FROM exam_subtopics s
            JOIN exam_topics t ON s.topic_id = t.id
            JOIN exams e ON s.exam_id = e.id
            WHERE s.slug = ? AND s.status = 'published'
        `, [slug]);
        
        if (subtopics.length === 0) {
            return res.status(404).json({ message: 'Content not found' });
        }
        
        const subtopic = subtopics[0];
        
        const jsonPath = path.join(__dirname, '..', subtopic.json_file_path);
        
        if (!fs.existsSync(jsonPath)) {
            return res.status(404).json({ message: 'Content file not found' });
        }
        
        const fileContent = fs.readFileSync(jsonPath, 'utf8');
        const contentData = JSON.parse(fileContent);
        
        await db.query('UPDATE exam_subtopics SET views = views + 1 WHERE id = ?', [subtopic.id]);
        
        res.json({
            ...subtopic,
            content: contentData
        });
        
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
