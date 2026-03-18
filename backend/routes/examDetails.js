const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// ============================================
// PUBLIC ROUTES
// ============================================

// Get exam details by exam slug
router.get('/exam/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        
        // First get exam id from slug
        const [exam] = await db.query(
            'SELECT id, name, slug FROM exams WHERE slug = ? AND is_active = 1',
            [slug]
        );
        
        if (exam.length === 0) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        // Get exam details
        const [details] = await db.query(
            `SELECT ed.*, e.name as exam_name, e.slug as exam_slug,
                    ec.name as category_name
             FROM exam_details ed
             JOIN exams e ON ed.exam_id = e.id
             JOIN exam_categories ec ON e.category_id = ec.id
             WHERE ed.exam_id = ? AND ed.is_published = 1`,
            [exam[0].id]
        );
        
        if (details.length === 0) {
            return res.status(404).json({ message: 'Exam details not found' });
        }
        
        // Update view count
        await db.query(
            'UPDATE exam_details SET views = views + 1 WHERE id = ?',
            [details[0].id]
        );
        
        // Get test series for this exam
        const [testSeries] = await db.query(
            `SELECT id, title, total_questions, duration, price, is_free 
             FROM tests 
             WHERE exam_id = ? AND status = 'published'`,
            [exam[0].id]
        );
        
        // Get study material for this exam
        const [studyMaterial] = await db.query(
            `SELECT id, title, category, views 
             FROM blogs 
             WHERE category LIKE ? AND status = 'published'`,
            [`%${details[0].category_name}%`]
        );
        
        res.json({
            ...details[0],
            test_series: testSeries,
            study_material: studyMaterial
        });
        
    } catch (error) {
        console.error('Error fetching exam details:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all published exams (for listing)
router.get('/exams-list', async (req, res) => {
    try {
        const [exams] = await db.query(
            `SELECT e.id, e.name, e.slug, e.short_name,
                    ec.name as category_name,
                    ed.id as details_id
             FROM exams e
             JOIN exam_categories ec ON e.category_id = ec.id
             LEFT JOIN exam_details ed ON e.id = ed.exam_id AND ed.is_published = 1
             WHERE e.is_active = 1`
        );
        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams list:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Get all exam pages (admin dashboard)
router.get('/admin/pages', auth, adminController.isAdmin, async (req, res) => {
    try {
        const [pages] = await db.query(
            `SELECT ed.*, e.name as exam_name, e.slug as exam_slug,
                    ec.name as category_name,
                    (SELECT COUNT(*) FROM tests WHERE exam_id = e.id) as test_count
             FROM exam_details ed
             JOIN exams e ON ed.exam_id = e.id
             JOIN exam_categories ec ON e.category_id = ec.id
             ORDER BY ed.updated_at DESC`
        );
        res.json(pages);
    } catch (error) {
        console.error('Error fetching exam pages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single exam page for editing
router.get('/admin/pages/:examId', auth, adminController.isAdmin, async (req, res) => {
    try {
        const [page] = await db.query(
            `SELECT ed.*, e.name as exam_name, e.slug
             FROM exam_details ed
             JOIN exams e ON ed.exam_id = e.id
             WHERE ed.exam_id = ?`,
            [req.params.examId]
        );
        
        if (page.length === 0) {
            return res.status(404).json({ message: 'Page not found' });
        }
        
        res.json(page[0]);
    } catch (error) {
        console.error('Error fetching exam page:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create/Update exam page
// Create/Update exam page - FIXED VERSION
router.post('/admin/pages/:examId', auth, adminController.isAdmin, async (req, res) => {
    try {
        const examId = req.params.examId;
        const data = req.body;
        
        console.log('📥 Received data for exam:', examId);
        console.log('Data keys:', Object.keys(data));
        
        // Validate examId
        if (!examId) {
            return res.status(400).json({ message: 'Exam ID is required' });
        }
        
        // Check if exam exists
        const [examExists] = await db.query(
            'SELECT id FROM exams WHERE id = ?',
            [examId]
        );
        
        if (examExists.length === 0) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        // Prepare data with defaults
        const pageData = {
            exam_id: examId,
            exam_title: data.exam_title || null,
            exam_full_form: data.exam_full_form || null,
            conducting_body: data.conducting_body || null,
            official_website: data.official_website || null,
            exam_language: data.exam_language ? JSON.stringify(data.exam_language) : JSON.stringify([]),
            exam_level: data.exam_level || null,
            exam_category: data.exam_category || null,
            exam_frequency: data.exam_frequency || null,
            about_exam: data.about_exam ? JSON.stringify(data.about_exam) : JSON.stringify({}),
            eligibility_criteria: data.eligibility_criteria ? JSON.stringify(data.eligibility_criteria) : JSON.stringify({}),
            age_limit: data.age_limit ? JSON.stringify(data.age_limit) : JSON.stringify({}),
            education_qualification: data.education_qualification ? JSON.stringify(data.education_qualification) : JSON.stringify({}),
            exam_pattern: data.exam_pattern ? JSON.stringify(data.exam_pattern) : JSON.stringify({}),
            detailed_syllabus: data.detailed_syllabus ? JSON.stringify(data.detailed_syllabus) : JSON.stringify({}),
            application_process: data.application_process ? JSON.stringify(data.application_process) : JSON.stringify({}),
            exam_centers: data.exam_centers ? JSON.stringify(data.exam_centers) : JSON.stringify({}),
            key_dates_format: data.key_dates_format ? JSON.stringify(data.key_dates_format) : JSON.stringify({}),
            post_selection_training: data.post_selection_training ? JSON.stringify(data.post_selection_training) : JSON.stringify({}),
            salary_and_perks: data.salary_and_perks ? JSON.stringify(data.salary_and_perks) : JSON.stringify({}),
            career_progression: data.career_progression ? JSON.stringify(data.career_progression) : JSON.stringify({}),
            related_exams: data.related_exams ? JSON.stringify(data.related_exams) : JSON.stringify([]),
            metadata: data.metadata ? JSON.stringify(data.metadata) : JSON.stringify({
                last_updated: new Date().toISOString().split('T')[0]
            }),
            meta_title: data.meta_title || data.exam_title || null,
            meta_description: data.meta_description || null,
            meta_keywords: data.meta_keywords || null,
            is_published: data.is_published || false,
            published_at: data.is_published ? new Date() : null
        };
        
        console.log('📤 Saving page data for exam:', examId);
        
        // Check if page exists
        const [existing] = await db.query(
            'SELECT id FROM exam_details WHERE exam_id = ?',
            [examId]
        );
        
        let result;
        if (existing.length > 0) {
            // Update
            console.log('Updating existing page');
            const [updateResult] = await db.query(
                `UPDATE exam_details SET ? WHERE exam_id = ?`,
                [pageData, examId]
            );
            result = updateResult;
        } else {
            // Create
            console.log('Creating new page');
            const [insertResult] = await db.query(
                `INSERT INTO exam_details SET ?`,
                pageData
            );
            result = insertResult;
        }
        
        console.log('✅ Page saved successfully');
        res.json({ 
            message: existing.length > 0 ? 'Exam page updated successfully' : 'Exam page created successfully',
            examId: examId
        });
        
    } catch (error) {
        console.error('❌ Error saving exam page:', error);
        console.error('SQL Error:', error.sql);
        console.error('SQL Message:', error.sqlMessage);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.sqlMessage || error.message 
        });
    }
});

// Toggle publish status
router.put('/admin/pages/:id/publish', auth, adminController.isAdmin, async (req, res) => {
    try {
        const { is_published } = req.body;
        
        await db.query(
            `UPDATE exam_details 
             SET is_published = ?, published_at = IF(? = 1, NOW(), NULL)
             WHERE id = ?`,
            [is_published, is_published, req.params.id]
        );
        
        res.json({ message: 'Page status updated' });
    } catch (error) {
        console.error('Error updating page status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete exam page
router.delete('/admin/pages/:id', auth, adminController.isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM exam_details WHERE id = ?', [req.params.id]);
        res.json({ message: 'Exam page deleted' });
    } catch (error) {
        console.error('Error deleting exam page:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all exams without pages
router.get('/admin/exams-without-pages', auth, adminController.isAdmin, async (req, res) => {
    try {
        const [exams] = await db.query(
            `SELECT e.id, e.name, e.slug, ec.name as category_name
             FROM exams e
             JOIN exam_categories ec ON e.category_id = ec.id
             LEFT JOIN exam_details ed ON e.id = ed.exam_id
             WHERE ed.id IS NULL AND e.is_active = 1`
        );
        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;