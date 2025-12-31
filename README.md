BeyondChats - AI-Powered Content Enhancement System

A full-stack application designed to automatically scrape blog articles from BeyondChats, perform deep research via Google Search (SerpApi), and professionally enhance the content using Google Gemini AI models.
🚀 Key Features

    Automated Web Scraping: A Node.js-based scraper that extracts titles and initial content from the BeyondChats blog.

    AI Research & Context Enrichment:

        SerpApi Integration: Automatically finds high-authority external references for every article.

        Gemini AI Enhancement: Rewrites content into a structured, professional Markdown format with improved readability.

    Intelligent Rate Limiting: Advanced handling of Google Gemini Free Tier limits (Error 429) using Exponential Backoff and Sequential Processing.

    Real-time Dashboard: A modern React frontend that connects to the PostgreSQL database to display articles with "AI Updated" badges and verified source links.
🛠️ Tech Stack

    Frontend: React.js, Axios, Lucide-React (Icons), CSS3 (Responsive Grid).

    Backend: Node.js, Express.js, Cheerio (Scraping), CORS.

    Database: PostgreSQL.

    APIs: Google Gemini AI (Generative AI), SerpApi (Google Search Results).

📊 Data Flow & Architecture Diagram

The following diagram illustrates how data moves from the source blog to the final user interface:

    Extraction: The Backend scrapes titles/content from the blog.

    Research: The system queries SerpApi for relevant external URLs.

    Enhancement: Gemini AI processes the original content + research data.

    Storage: Updated content and reference links are stored in PostgreSQL.

    Delivery: The React Dashboard fetches and displays both "Original" and "AI Updated" states.

⚙️ Local Setup Instructions
1. Database Setup

Create a PostgreSQL database named beyondchats_db and execute the following query:
SQL

CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT,
    content TEXT,
    source_links TEXT[],
    is_updated BOOLEAN DEFAULT FALSE
);

2. Backend Setup


cd backend
npm install
# Create a .env file with your DB_USER, DB_PASSWORD, and API_KEYS
node index.js

3. Frontend Setup


cd frontend
npm install
npm start

⚠️ Challenges & Solutions: Handling "Error 429"

During development, strict rate limits from the Gemini API ("limit: 0" on new accounts) were encountered. The following strategies were implemented:

    Sequential Processing: Replaced parallel forEach loops with for...of loops to process articles one by one.

    Cooldown Mechanism: Integrated a mandatory 30–60 second delay between API calls to comply with the Free Tier quota.

    Key Rotation: Implemented "Round Robin" logic to automatically switch between multiple API keys.
dataFlow diagram=[!dataflow](dataflow.png)
🔗 Live Links

    Frontend Demo: https://beyond-chats-azure.vercel.app/

    Backend API:https://beyondchats-gvsw.onrender.com

Note to Evaluator: The dashboard differentiates between original and AI-enhanced articles using color-coded badges. You can trigger a new update cycle via the /api/articles/update-articles endpoint.


Before v/s After
Before=[!before](Before.png)

After AI enhancement
After=[!after](After.png)