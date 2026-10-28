const mysql = require('mysql2/promise');

let pool = null;

const connectMySQL = async () => {
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const port = Number(process.env.MYSQL_PORT) || 25974;
  const database = process.env.MYSQL_DATABASE || 'defaultdb';

  if (!host || !user) {
    console.log('⚠️  MySQL credentials not provided in .env. Skipping MySQL connection.');
    return null;
  }

  try {
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: false
      }
    });

    const [rows] = await pool.query('SELECT 1 + 1 AS connected, VERSION() AS version');
    console.log(`✅ Aiven MySQL Connected: ${host}:${port} (Version: ${rows[0].version})`);
    return pool;
  } catch (err) {
    console.error('❌ Aiven MySQL Connection Failed:', err.message);
    return null;
  }
};

const getMySQLPool = () => pool;

module.exports = { connectMySQL, getMySQLPool };
