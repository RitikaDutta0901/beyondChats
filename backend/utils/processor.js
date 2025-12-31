require('dotenv').config();
const axios = require('axios');
const pool = require('../config/db');

// API Keys loading from .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SERP_API_KEY = process.env.SERP_API_KEY;

const callGeminiWithRetry = async (payload, retries = 2, backoff = 10000) => {
    // Using gemini-2.0-flash as per your latest available models list
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    try {
        const response = await axios.post(url, payload);
        return response.data;
    } catch (err) {
        const status = err.response ? err.response.status : 500;
        
        // Handle Leaked Key (403) or Quota (429)
        if (status === 403) {
            throw new Error("API Key issue: Please check if the new key is active in .env");
        }

        if ((status === 429 || status === 500 || status === 503) && retries > 0) {
            console.log(`⚠️ Model Busy. Retrying in ${backoff/1000}s...`);
            await new Promise(r => setTimeout(r, backoff));
            return callGeminiWithRetry(payload, retries - 1, backoff * 2);
        }
        throw err;
    }
};

async function processArticle(article) {
    try {
        console.log(`\n🔍 Phase 2: Processing "${article.title}"`);

        // --- STEP 1: RESEARCH VIA SERPAPI ---
        let sourceLinks = ["https://beyondchats.com"]; 
        try {
            const searchRes = await axios.get('https://serpapi.com/search', {
                params: {
                    q: article.title,
                    api_key: SERP_API_KEY,
                    engine: "google",
                    num: 2 
                }
            });
            if (searchRes.data.organic_results) {
                sourceLinks = searchRes.data.organic_results.map(r => r.link);
                console.log(`🌐 Research links found.`);
            }
        } catch (sErr) {
            console.log("⚠️ SerpApi Search failed, using default links.");
        }

        // --- STEP 2: GENERATE AI CONTENT ---
        console.log(`🤖 Calling Gemini 2.0 Flash...`);
        const payload = {
            contents: [{
                parts: [{
                    text: `Professionally rewrite this article in Markdown format with headings. 
                           Base your research on these links: ${sourceLinks.join(", ")}.
                           Original Title: ${article.title}. 
                           Original Content: ${article.content}.`
                }]
            }]
        };

        const data = await callGeminiWithRetry(payload);
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const updatedBody = data.candidates[0].content.parts[0].text;
            
            // --- STEP 3: UPDATE DB ---
            await pool.query(
                'UPDATE articles SET content = $1, source_links = $2, is_updated = TRUE WHERE id = $3',
                [updatedBody, sourceLinks, article.id]
            );
            console.log(`✅ SUCCESS: Article ID ${article.id} is now AI Updated!`);
        }

    } catch (err) {
        console.error(`❌ Error for ID ${article.id}:`, err.message);
    }
}

module.exports = { processArticle };