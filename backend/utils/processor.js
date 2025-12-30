const axios = require('axios');
const pool = require('../config/db');

const GEMINI_API_KEY = "AIzaSyB8NVzQx98FV9UtnFB98b7HGMW0x0VTq70"; 

// Retry function for Quota issues
const callGeminiWithRetry = async (payload, retries = 3, backoff = 30000) => {
    // Aapki list se sabse stable model uthaya hai
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    try {
        const response = await axios.post(url, payload);
        return response.data;
    } catch (err) {
        if (err.response && err.response.status === 429 && retries > 0) {
            console.log(`⚠️ Quota full. Retrying in ${backoff/1000}s...`);
            await new Promise(r => setTimeout(r, backoff));
            return callGeminiWithRetry(payload, retries - 1, backoff * 2);
        }
        throw err;
    }
};

async function processArticle(article) {
    try {
        console.log(`\n🚀 Processing: ${article.title}`);

        const payload = {
            contents: [{
                parts: [{
                    text: `Rewrite this article professionally with Markdown headings: 
                           Title: ${article.title}. Content: ${article.content}`
                }]
            }]
        };

        const data = await callGeminiWithRetry(payload);
        
        if (data.candidates) {
            const updatedBody = data.candidates[0].content.parts[0].text;
            await pool.query(
                'UPDATE articles SET content = $1, is_updated = TRUE WHERE id = $2',
                [updatedBody, article.id]
            );
            console.log(`✅ SUCCESS: Article ${article.id} updated!`);
        }

    } catch (err) {
        console.error("❌ Final Error:", err.response ? err.response.status : err.message);
    }
}

module.exports = { processArticle };