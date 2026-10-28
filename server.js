// Load env vars first
const dotenv = require('dotenv');
dotenv.config();

const { connectMySQL } = require('./src/config/mysql');
const { initializeDatabase } = require('./src/config/initDb');
const app = require('./src/app');

const startServer = async () => {
  try {
    // Connect exclusively to Aiven MySQL
    const pool = await connectMySQL();
    if (pool) {
      await initializeDatabase();
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT} (Database: Aiven MySQL Only)`);
    });
  } catch (err) {
    console.error('Fatal Server Startup Error:', err.message);
  }
};

startServer();
