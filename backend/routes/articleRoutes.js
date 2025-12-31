const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { processArticle } = require('../utils/processor');

// --- API KEYS DIRECT CONFIGURATION ---
const SERP_API_KEY = "dde66445cc78cf31ac9ae5acee2e91ea4314709259e6ed9a26d6e9b442501843";
const GEMINI_API_KEY = "AIzaSyDcwLeh9V76hj4kA77aiExbEc-kQgAMpqg";

// 1. READ (Get all articles)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM articles ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. CREATE (Manual entry)
router.post('/', async (req, res) => {
    const { title, content } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO articles (title, content, original_content) VALUES ($1, $2, $2) RETURNING *',
            [title, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. UPDATE (AI ya Manual Update) - Cleaned version
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, is_updated, source_links } = req.body;
    try {
        // Agar title bheja hai toh title update karo, warna sirf content/status
        const query = title 
            ? 'UPDATE articles SET title=$1, content=$2, is_updated=$3, source_links=$4 WHERE id=$5 RETURNING *'
            : 'UPDATE articles SET content=$1, is_updated=$2, source_links=$3 WHERE id=$4 RETURNING *';
        
        const params = title ? [title, content, is_updated, source_links, id] : [content, is_updated, source_links, id];
        
        const result = await pool.query(query, params);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. DELETE
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM articles WHERE id = $1', [id]);
        res.json({ message: "Article deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. TRIGGER AI UPDATE (Phase 2 Script Trigger)
router.get('/update-articles', async (req, res) => {
    res.write("AI processing started. Please wait...\n");
    try {
        const articles = await pool.query('SELECT * FROM articles WHERE is_updated = FALSE LIMIT 5');
        
        for (const article of articles.rows) {
            await processArticle(article);
            res.write(`Updated article: ${article.title}\n`);
            
            // --- EK ARTICLE KE BAAD 20 SECONDS KA WAIT ---
            console.log("Waiting 20s for next request to avoid 429...");
            await new Promise(resolve => setTimeout(resolve, 20000)); 
        }
        res.end("All articles processed successfully! ✅");
    } catch (err) {
        console.error("Loop Error:", err.message);
        res.status(500).end("Error during processing.");
    }
});
module.exports = router;