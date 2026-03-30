const express = require('express');
const router = express.Router();
const axios = require('axios');
const xml2js = require('xml2js');
const db = require('../config/database');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
const RSS_FEEDS = [
  { url: 'https://news.google.com/rss/search?q=current+affairs+india&hl=hi&gl=IN&ceid=IN:hi', category: 'Current Affairs' },
  { url: 'https://news.google.com/rss/search?q=government+scheme+india&hl=hi&gl=IN&ceid=IN:hi', category: 'Sarkari Yojana' },
  { url: 'https://news.google.com/rss/search?q=science+technology+india&hl=hi&gl=IN&ceid=IN:hi', category: 'Vigyan & Tech' },
  { url: 'https://news.google.com/rss/search?q=economy+india&hl=hi&gl=IN&ceid=IN:hi', category: 'Arthvyavastha' },
  { url: 'https://news.google.com/rss/search?q=sports+india&hl=hi&gl=IN&ceid=IN:hi', category: 'Khel' },
  { url: 'https://news.google.com/rss/search?q=international+news&hl=hi&gl=IN&ceid=IN:hi', category: 'Antarrashtriya' },
  { url: 'https://news.google.com/rss/search?q=environment+climate+india&hl=hi&gl=IN&ceid=IN:hi', category: 'Paryavaran' },
];

async function parseRSS(url) {
  try {
    const res = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (TestHubBot/1.0)' }
    });
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(res.data);
    const items = result?.rss?.channel?.item;
    if (!items) return [];
    const arr = Array.isArray(items) ? items : [items];
    return arr.slice(0, 6).map(item => {
      const parts = (item.title || '').split(' - ');
      const source = parts.pop()?.trim() || '';
      const title = parts.join(' - ').trim();
      return { title, link: item.link || '', source, pub_date: item.pubDate || new Date() };
    });
  } catch { return []; }
}

// ← generateSummary wala purana function HATAO, YE NAYA RAKHO
async function generateComprehensiveStudyMaterial(title) {
  try {
    const prompt = `News headline: "${title}"
    
Is news ko competitive exam (UPSC, SSC, Banking) ki taiyari karne wale students ke liye analyze karo. 
Neeche diye gaye strictly JSON format mein output do. Bhasha simple Hindi aur English mix (Hinglish) rakho:
{
  "subject_tag": "(Jaise: Economy, Polity, Environment, etc.)",
  "quick_summary": [
    "(Point 1: Main news kya hai)",
    "(Point 2: Ye kyu important hai)"
  ],
  "static_gk_fact": "(Is news se juda koi static history/geography/polity fact jo exam me aa sakta hai)",
  "important_terms": [
    { "term": "(Koi technical word ya concept)", "meaning": "(Uska simple meaning)" }
  ],
  "practice_mcq": {
    "question": "(Is news par ek standard exam level MCQ banaiye)",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "answer": "(Correct option)",
    "explanation": "(Answer ka 1 line explanation)"
  }
}
Sirf valid JSON output do, markdown ya koi aur text nahi.`;
    const result = await model.generateContent(prompt);
    let rawText = result.response.text();
    rawText = rawText.replace(/```json|```/g, '').trim();
    return JSON.parse(rawText);
  } catch (error) {
    console.error("AI Generation failed:", error);
    return null;
  }
}

async function fetchAndStoreNews() {
  console.log('📡 News fetch shuru...', new Date().toLocaleString('hi-IN'));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await db.query('DELETE FROM current_affairs WHERE fetched_at >= ?', [today]);
  let totalSaved = 0;
  for (const feed of RSS_FEEDS) {
    const items = await parseRSS(feed.url);
    for (const item of items) {
const studyMaterial = await generateComprehensiveStudyMaterial(item.title);
await db.query(
  `INSERT INTO current_affairs (title, link, source, category, pub_date, study_material) VALUES (?, ?, ?, ?, ?, ?)`,
  [item.title, item.link, item.source, feed.category, new Date(item.pub_date),
   studyMaterial ? JSON.stringify(studyMaterial) : null]
);
      totalSaved++;
    }
    await new Promise(r => setTimeout(r, 800));
  }
  console.log(`✅ ${totalSaved} news save ho gayi`);
  return totalSaved;
}

// ─── IMPORTANT: Specific routes PEHLE, dynamic routes BAAD mein ───

// 1. GET /api/news/dates
router.get('/dates', async (req, res) => {
  try {
    const [rows] = await db.query(`
  SELECT 
    DATE(fetched_at + INTERVAL 330 MINUTE) as date,
    COUNT(*) as total
  FROM current_affairs
  GROUP BY DATE(fetched_at + INTERVAL 330 MINUTE)
  ORDER BY date DESC
  LIMIT 30
`);
    res.json({ success: true, dates: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. POST /api/news/fetch
router.post('/fetch', async (req, res) => {
  try {
    const count = await fetchAndStoreNews();
    res.json({ success: true, message: `${count} news fetch ho gayi` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. GET /api/news/single/:id
router.get('/single/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM current_affairs WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'News nahi mili' });
    res.json({ success: true, news: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. GET /api/news?date=2026-03-21  ← SABSE LAST mein
router.get('/', async (req, res) => {
  try {
    const date = req.query.date || 
      new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // ← IST date

    const [rows] = await db.query(
  `SELECT * FROM current_affairs 
   WHERE DATE(fetched_at + INTERVAL 330 MINUTE) = ?
   ORDER BY category, pub_date DESC`,
  [date]
);

    const grouped = {};
    rows.forEach(row => {
      if (!grouped[row.category]) grouped[row.category] = [];
      grouped[row.category].push(row);
    });

    res.json({
      success: true,
      date,
      totalItems: rows.length,
      categories: Object.keys(grouped).map(cat => ({
        category: cat,
        items: grouped[cat]
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = { router, fetchAndStoreNews };