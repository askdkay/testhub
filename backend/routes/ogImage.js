const express = require('express');
const router = express.Router();
const { createCanvas } = require('canvas');

router.get('/exams/:slug', async (req, res) => {
    const { slug } = req.params;
    
    // Get exam details from database
    const [exam] = await db.query('SELECT name, category FROM exams WHERE slug = ?', [slug]);
    
    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 1200, 630);
    
    // Gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#0f3460');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px "Poppins"';
    ctx.fillText(exam[0]?.name || 'Exam', 100, 300);
    
    ctx.font = '24px "Poppins"';
    ctx.fillStyle = '#4ade80';
    ctx.fillText('Complete Test Series', 100, 380);
    
    // Send image
    res.setHeader('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res);
});

module.exports = router;