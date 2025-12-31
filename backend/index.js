const express = require('express');
const cors = require('cors'); 
const dotenv = require('dotenv');
const articleRoutes = require('./routes/articleRoutes');
// --- NAYA IMPORT YAHAN HAI (PHASE 1) ---
const { scrapeArticles } = require('./utils/scraper'); 

dotenv.config();

const app = express();

// --- MIDDLEWARE SECTION ---
app.use(cors()); 
app.use(express.json());

// --- ROUTES SECTION ---
app.use('/api/articles', articleRoutes);

// --- NAYA SCRAPE ROUTE (PHASE 1 TRIGGER) ---
// Isse aap browser mein hit karke original data fetch kar sakti hain
app.get('/scrape-blogs', async (req, res) => {
    try {
        await scrapeArticles();
        res.json({ message: "Scraping completed and original data stored! ✅" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Root route (Testing ke liye)
app.get('/', (req, res) => {
    res.send("Backend is working and CORS is enabled!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Frontend can now access: http://localhost:${PORT}/api/articles`);
});