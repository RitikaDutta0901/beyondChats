const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { processArticle } = require('../utils/processor');

// Trigger Update
router.get('/update-articles', async (req, res) => {
    res.send("AI processing started. Check terminal.");
    try {
        const articles = await pool.query('SELECT * FROM articles WHERE is_updated = FALSE');
        for (const article of articles.rows) {
            await processArticle(article);
        }
    } catch (err) {
        console.error("Loop Error:", err.message);
    }
});

// Get Articles
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM articles ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;