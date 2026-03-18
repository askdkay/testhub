const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// ============================================
// GET ROUTES
// ============================================

// Get categories for dropdown
router.get('/categories', auth, adminController.isAdmin, async (req, res) => {
    try {
        const [categories] = await db.query(
            'SELECT id, name FROM exam_categories WHERE is_active = 1 ORDER BY name'
        );
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get exams for dropdown
router.get('/exams', auth, adminController.isAdmin, async (req, res) => {
    try {
        const { category_id } = req.query;
        
        let query = `
            SELECT e.id, e.name, e.slug, ec.name as category_name
            FROM exams e
            JOIN exam_categories ec ON e.category_id = ec.id
            WHERE e.is_active = 1
        `;
        const params = [];
        
        if (category_id) {
            query += ` AND e.category_id = ?`;
            params.push(category_id);
        }
        
        query += ` ORDER BY ec.name, e.name`;
        
        const [exams] = await db.query(query, params);
        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get generation history
router.get('/history', auth, adminController.isAdmin, async (req, res) => {
    try {
        const [history] = await db.query(
            `SELECT p.*, 
                    ec.name as category_name,
                    e.name as exam_name,
                    u.name as admin_name,
                    COUNT(q.id) as total_generated,
                    SUM(CASE WHEN q.is_approved = 1 THEN 1 ELSE 0 END) as approved_count
             FROM ai_generation_prompts p
             LEFT JOIN exam_categories ec ON p.category_id = ec.id
             LEFT JOIN exams e ON p.exam_id = e.id
             JOIN users u ON p.admin_id = u.id
             LEFT JOIN ai_generated_questions q ON p.id = q.prompt_id
             GROUP BY p.id
             ORDER BY p.created_at DESC
             LIMIT 50`
        );
        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get generated questions by prompt ID
router.get('/generated/:promptId', auth, adminController.isAdmin, async (req, res) => {
    try {
        const [questions] = await db.query(
            'SELECT * FROM ai_generated_questions WHERE prompt_id = ? ORDER BY id',
            [req.params.promptId]
        );
        res.json(questions);
    } catch (error) {
        console.error('Error fetching generated questions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// GENERATE ROUTE - WITH ALL FUNCTIONS DEFINED
// ============================================

router.post('/generate', auth, adminController.isAdmin, async (req, res) => {
    try {
        console.log('📥 Generate request received:', req.body);
        
        const {
            category_id,
            exam_id,
            prompt,
            question_type = 'mcq',
            difficulty = 'medium',
            num_questions = 10
        } = req.body;

        // Validation
        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        // Get exam details for context
        let examContext = '';
        let examName = '';
        let categoryName = '';
        
        if (exam_id) {
            const [exam] = await db.query(
                `SELECT e.name, e.full_form, e.description, ec.name as category
                 FROM exams e
                 JOIN exam_categories ec ON e.category_id = ec.id
                 WHERE e.id = ?`,
                [exam_id]
            );
            if (exam.length > 0) {
                examContext = `Exam: ${exam[0].name}\nCategory: ${exam[0].category}\nDescription: ${exam[0].description || ''}\n\n`;
                examName = exam[0].name;
                categoryName = exam[0].category;
            }
        }

        // Save prompt to database
        const [promptResult] = await db.query(
            `INSERT INTO ai_generation_prompts 
             (admin_id, category_id, exam_id, prompt_text, question_type, difficulty, num_questions, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'processing')`,
            [req.userId, category_id || null, exam_id || null, prompt, question_type, difficulty, num_questions]
        );

        const promptId = promptResult.insertId;
        console.log('✅ Prompt saved with ID:', promptId);

        // Generate questions using Gemini
        let generatedQuestions;
        let generatedTitle;
        
        try {
            // Generate title first
            generatedTitle = await generateTestTitle(prompt, examName, categoryName);
            
            // Then generate questions
            generatedQuestions = await generateQuestionsWithGemini(
                prompt,
                examContext,
                question_type,
                difficulty,
                num_questions
            );
        } catch (geminiError) {
            console.error('❌ Gemini generation failed:', geminiError);
            generatedTitle = `${prompt} - AI Generated Test`;
            generatedQuestions = generateMockQuestions(prompt, question_type, difficulty, num_questions);
        }

        // Save generated questions to database
        for (const q of generatedQuestions) {
            await db.query(
                `INSERT INTO ai_generated_questions 
                 (prompt_id, question_text, question_text_hindi, option_a, option_b, option_c, option_d,
                  correct_answer, explanation, explanation_hindi, difficulty, topic)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    promptId,
                    q.question_text || '',
                    q.question_text_hindi || '',
                    q.option_a || '',
                    q.option_b || '',
                    q.option_c || '',
                    q.option_d || '',
                    q.correct_answer || 'A',
                    q.explanation || '',
                    q.explanation_hindi || '',
                    q.difficulty || difficulty,
                    q.topic || 'General'
                ]
            );
        }

        // Fetch saved questions with their IDs
        const [savedQuestions] = await db.query(
            'SELECT * FROM ai_generated_questions WHERE prompt_id = ? ORDER BY id',
            [promptId]
        );

        // Update prompt status
        await db.query(
            `UPDATE ai_generation_prompts 
             SET status = 'completed', generated_count = ?
             WHERE id = ?`,
            [generatedQuestions.length, promptId]
        );

        console.log('✅ Questions generated and saved:', savedQuestions.length);

        res.json({
            message: 'Questions generated successfully',
            promptId,
            questions: savedQuestions, // Send back questions with real IDs
            suggestedTitle: generatedTitle,
            examName,
            categoryName
        });

    } catch (error) {
        console.error('❌ Error generating questions:', error);
        res.status(500).json({ message: 'Error generating questions: ' + error.message });
    }
});

// ============================================
// UPDATE GENERATED QUESTION
// ============================================

router.put('/generated/:questionId', auth, adminController.isAdmin, async (req, res) => {
    try {
        const questionId = req.params.questionId;
        
        if (!questionId || questionId === 'undefined') {
            return res.status(400).json({ message: 'Invalid question ID' });
        }

        console.log('Updating question:', questionId, req.body);
        
        const {
            is_approved,
            is_rejected,
            question_text,
            question_text_hindi,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            explanation,
            explanation_hindi,
            difficulty,
            topic
        } = req.body;

        const [existing] = await db.query(
            'SELECT * FROM ai_generated_questions WHERE id = ?',
            [questionId]
        );

        if (existing.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }

        await db.query(
            `UPDATE ai_generated_questions 
             SET 
                is_approved = ?,
                is_rejected = ?,
                question_text = ?,
                question_text_hindi = ?,
                option_a = ?,
                option_b = ?,
                option_c = ?,
                option_d = ?,
                correct_answer = ?,
                explanation = ?,
                explanation_hindi = ?,
                difficulty = ?,
                topic = ?
             WHERE id = ?`,
            [
                is_approved || false,
                is_rejected || false,
                question_text || '',
                question_text_hindi || '',
                option_a || '',
                option_b || '',
                option_c || '',
                option_d || '',
                correct_answer || 'A',
                explanation || '',
                explanation_hindi || '',
                difficulty || 'medium',
                topic || '',
                questionId
            ]
        );

        if (is_approved) {
            await db.query(
                `UPDATE ai_generation_prompts 
                 SET accepted_count = accepted_count + 1 
                 WHERE id = ?`,
                [existing[0].prompt_id]
            );
        }

        res.json({ 
            message: 'Question updated successfully',
            questionId: questionId 
        });

    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// ============================================
// CREATE TEST FROM APPROVED QUESTIONS
// ============================================

router.post('/create-test', auth, adminController.isAdmin, async (req, res) => {
    try {
        console.log('📥 Creating test from AI generated questions:', req.body);
        
        const {
            prompt_id,
            title,
            description,
            category_id,
            exam_id,
            duration,
            is_free,
            price,
            negative_marking,
            passing_marks,
            instructions,
            questions,
            publish_now = false
        } = req.body;

        if (!questions || questions.length === 0) {
            return res.status(400).json({ message: 'No questions provided' });
        }

        const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 4), 0);

        const [testResult] = await db.query(
            `INSERT INTO tests (
                title, description, category_id, exam_id, duration,
                total_questions, total_marks, passing_marks, negative_marking,
                is_free, price, instructions, status, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                description || `AI Generated test based on: ${title}`,
                category_id || null,
                exam_id || null,
                duration || 60,
                questions.length,
                totalMarks,
                passing_marks || 40,
                negative_marking || 0.25,
                is_free || true,
                price || 0,
                instructions || 'Read each question carefully.',
                publish_now ? 'published' : 'draft',
                req.userId
            ]
        );

        const testId = testResult.insertId;

        for (const q of questions) {
            await db.query(
                `INSERT INTO questions (
                    test_id, question_text, question_text_hindi,
                    option_a, option_b, option_c, option_d,
                    correct_answer, explanation, explanation_hindi,
                    marks, difficulty, topic
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    testId,
                    q.question_text || '',
                    q.question_text_hindi || '',
                    q.option_a || '',
                    q.option_b || '',
                    q.option_c || '',
                    q.option_d || '',
                    q.correct_answer || 'A',
                    q.explanation || '',
                    q.explanation_hindi || '',
                    q.marks || 4,
                    q.difficulty || 'medium',
                    q.topic || 'General'
                ]
            );
        }

        if (prompt_id) {
            await db.query(
                `UPDATE ai_generation_prompts 
                 SET test_id = ? 
                 WHERE id = ?`,
                [testId, prompt_id]
            );
        }

        console.log('✅ Test created successfully:', testId);

        res.json({
            message: publish_now ? 'Test published successfully' : 'Test saved as draft',
            testId,
            questionCount: questions.length,
            status: publish_now ? 'published' : 'draft'
        });

    } catch (error) {
        console.error('❌ Error creating test:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// ============================================
// HELPER FUNCTIONS - MUST BE DEFINED
// ============================================

// Generate Test Title using Gemini
async function generateTestTitle(prompt, examName, categoryName) {
    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

        const titlePrompt = `Generate a professional test title for a competitive exam mock test.
        
Context:
- User Prompt: ${prompt}
${examName ? `- Exam: ${examName}` : ''}
${categoryName ? `- Category: ${categoryName}` : ''}

The title should be:
1. Professional and exam-appropriate
2. Include the main topic
3. Around 5-10 words

Return ONLY the title text, nothing else.`;

        const result = await model.generateContent(titlePrompt);
        const response = await result.response;
        let title = response.text().trim();
        title = title.replace(/^["']|["']$/g, '');
        return title;

    } catch (error) {
        console.error('Error generating title:', error);
        return `${prompt.split(' ').slice(0, 5).join(' ')} - Mock Test`;
    }
}

// Generate Questions with Gemini
async function generateQuestionsWithGemini(prompt, examContext, questionType, difficulty, numQuestions) {
    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not found');
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

        const fullPrompt = `You are an expert exam question generator for competitive exams in India.

${examContext}
Generate EXACTLY ${numQuestions} ${questionType} questions at ${difficulty} difficulty level.
Topic/Specific Requirements: ${prompt}

For each question, provide in valid JSON format with these exact fields:
{
    "question_text": "Question in English",
    "question_text_hindi": "Question in Hindi (translate if possible)",
    "option_a": "First option",
    "option_b": "Second option", 
    "option_c": "Third option",
    "option_d": "Fourth option",
    "correct_answer": "A/B/C/D",
    "explanation": "Detailed explanation in English",
    "explanation_hindi": "Explanation in Hindi (translate if possible)",
    "difficulty": "${difficulty}",
    "topic": "Topic name"
}

IMPORTANT RULES:
1. Return ONLY a valid JSON array
2. All fields must be filled
3. Questions should be relevant to competitive exams
4. Each question must have 4 distinct options

JSON array:`;

        console.log('📤 Sending prompt to Gemini for questions...');
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ Received response from Gemini');

        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/```json\n?|\n?```/g, '');
        } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/```\n?|\n?```/g, '');
        }
        
        const questions = JSON.parse(cleanText);
        
        if (!Array.isArray(questions)) {
            throw new Error('Response is not an array');
        }

        return questions.map((q, index) => ({
            ...q,
            tempId: index + 1
        }));

    } catch (error) {
        console.error('❌ Gemini Questions API Error:', error.message);
        throw error;
    }
}

// Mock data generator (fallback)
function generateMockQuestions(prompt, type, difficulty, count) {
    const questions = [];
    for (let i = 1; i <= count; i++) {
        questions.push({
            question_text: `Sample question ${i} about ${prompt}`,
            question_text_hindi: `नमूना प्रश्न ${i}: ${prompt}`,
            option_a: 'First option',
            option_b: 'Second option',
            option_c: 'Third option',
            option_d: 'Fourth option',
            correct_answer: ['A','B','C','D'][i % 4],
            explanation: 'This is a sample explanation',
            explanation_hindi: 'यह एक नमूना व्याख्या है',
            difficulty: difficulty,
            topic: 'General'
        });
    }
    return questions;
}

module.exports = router;