const axios = require('axios');
const GEMINI_API_KEY = "AIzaSyB8NVzQx98FV9UtnFB98b7HGMW0x0VTq70"; 

async function getAvailableModels() {
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
        console.log("Aapki key ke liye available models ye hain:");
        response.data.models.forEach(m => {
            if (m.supportedGenerationMethods.includes("generateContent")) {
                console.log(`- ${m.name}`);
            }
        });
    } catch (err) {
        console.error("Error fetching models:", err.response ? err.response.data : err.message);
    }
}
getAvailableModels();