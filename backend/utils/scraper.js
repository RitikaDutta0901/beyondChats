const axios = require('axios');
const cheerio = require('cheerio');
const pool = require('../config/db');

const scrapeOldestArticles = async () => {
    try {
        const baseUrl = "https://beyondchats.com/blogs/";
        const { data } = await axios.get(baseUrl);
        const $ = cheerio.load(data);

        // Sabse pehle last page number nikalte hain
        let lastPageNum = 1;
        $('.page-numbers').each((i, el) => {
            const num = parseInt($(el).text());
            if (!isNaN(num) && num > lastPageNum) lastPageNum = num;
        });

        let articles = [];
        let currentPage = lastPageNum;

        // Loop: Jab tak 5 articles na mil jayein pichle pages check karo
        while (articles.length < 5 && currentPage > 0) {
            const pageUrl = currentPage === 1 ? baseUrl : `${baseUrl}page/${currentPage}/`;
            console.log(`Searching for more articles on: ${pageUrl}`);
            
            const response = await axios.get(pageUrl);
            const $page = cheerio.load(response.data);

            // .ast-article-post ya article tag use karein
            const pageArticles = [];
            $page('article').each((i, el) => {
                const title = $page(el).find('h2, .entry-title').text().trim();
                const url = $page(el).find('a').attr('href');
                const content = $page(el).find('.entry-content, .ast-content-excerpt').text().trim();
                
                if (title && url) {
                    pageArticles.push({ title, url, content });
                }
            });

            // Oldest articles chahiye isliye reverse order mein add karein
            articles = [...articles, ...pageArticles.reverse()];
            currentPage--; 
        }

        // Sirf top 5 oldest rakhein
        const finalArticles = articles.slice(0, 5);

        for (let article of finalArticles) {
            await pool.query(
                'INSERT INTO articles (title, url, content) VALUES ($1, $2, $3) ON CONFLICT (url) DO NOTHING',
                [article.title, article.url, article.content]
            );
        }

        return { message: `${finalArticles.length} Oldest articles saved!`, articles: finalArticles };
    } catch (error) {
        console.error("Scraping error:", error.message);
        return { error: error.message };
    }
};

module.exports = scrapeOldestArticles;