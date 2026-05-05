require('dotenv').config({ path: '../../packages/db/.env' });
console.log("DB ENV LOADED:", process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "YES" : "NO");
