const express = require('express');
const cors = require('cors'); // CORS import kiya
const dotenv = require('dotenv');
const articleRoutes = require('./routes/articleRoutes');

dotenv.config();

const app = express();

// --- MIDDLEWARE SECTION ---
// Sabse pehle CORS lagana hai taaki Frontend (3000) Backend (5000) se baat kar sake
app.use(cors()); 

// Body parser taaki JSON data handle ho sake
app.use(express.json());

// --- ROUTES SECTION ---
app.use('/api/articles', articleRoutes);

// Root route (Testing ke liye)
app.get('/', (req, res) => {
    res.send("Backend is working and CORS is enabled!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Frontend can now access: http://localhost:${PORT}/api/articles`);
});