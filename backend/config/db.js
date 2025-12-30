const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: 'postgres',           // Aapka DB user
    host: 'localhost',
    database: 'beyondchats_db',
    password: 'riti182209', // Yahan apna asli Postgres password likhein (String mein)
    port: 5432
});

// YEH SABSE ZARURI HAI: module.exports ke saath pool likhna
module.exports = pool;