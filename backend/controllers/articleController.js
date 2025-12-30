const pool = require('../config/db');

// Saare articles get karne ke liye
exports.getArticles = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM articles ORDER BY created_at ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Naya article add karne ke liye (Create)
exports.createArticle = async (req, res) => {
    const { title, content, url } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO articles (title, content, url) VALUES ($1, $2, $3) RETURNING *',
            [title, content, url]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};