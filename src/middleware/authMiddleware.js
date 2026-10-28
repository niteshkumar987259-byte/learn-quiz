const jwt = require('jsonwebtoken');
const { getMySQLPool } = require('../config/mysql');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_learning_path_generator_2026');

      const pool = getMySQLPool();
      if (pool) {
        const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [decoded.id]);
        if (rows.length > 0) {
          req.user = {
            _id: rows[0].id,
            id: rows[0].id,
            name: rows[0].name,
            email: rows[0].email
          };
        }
      }

      if (!req.user) {
        req.user = {
          _id: decoded.id,
          id: decoded.id,
          name: 'Student',
          email: 'student@example.com'
        };
      }

      return next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
