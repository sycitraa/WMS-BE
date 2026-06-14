require('dotenv').config();
const app = require('./src/app');

// Validasi environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`FATAL ERROR: Environment variables wajib berikut tidak ditemukan: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});