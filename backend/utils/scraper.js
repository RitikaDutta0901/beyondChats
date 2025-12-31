const axios = require('axios');
const cheerio = require('cheerio');
const pool = require('../config/db');

const scrapeArticles = async () => {
    try {
        console.log("Fetching from BeyondChats...");
        const url = 'https://beyondchats.com/blogs/';
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        
        const scrapedData = [];

        // Ye selectors BeyondChats ke naye layout ke hisaab se hain
        $('article, .elementor-post, .post').each((index, element) => {
            if (index < 5) {
                const title = $(element).find('h1, h2, h3, .elementor-post__title').first().text().trim();
                const content = $(element).find('.elementor-post__excerpt, p').first().text().trim();
                
                if (title) {
                    scrapedData.push({ title, content });
                }
            }
        });

        console.log(`Found ${scrapedData.length} articles. Inserting into DB...`);

        if (scrapedData.length === 0) {
            console.log("Warning: No articles found. Please check if the URL is accessible.");
            return;
        }

        for (const item of scrapedData) {
            await pool.query(
                `INSERT INTO articles (title, content, original_content, is_updated) 
                 VALUES ($1, $2, $3, $4) ON CONFLICT (title) DO NOTHING`,
                [item.title, item.content, item.content, false]
            );
            console.log(`Saved to DB: ${item.title}`);
        }
    } catch (error) {
        console.error("Scraper Error:", error.message);
    }
};

module.exports = { scrapeArticles };