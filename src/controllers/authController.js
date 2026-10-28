const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getMySQLPool } = require('../config/mysql');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_learning_path_generator_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter all required fields' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const pool = getMySQLPool();
    if (!pool) {
      return res.status(500).json({ success: false, message: 'Database connection unavailable' });
    }

    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword]
    );

    const userId = result.insertId;

    // Create initial student profile
    await pool.query(
      `INSERT INTO student_profiles (user_id, education_level, career_goal, experience_level, existing_skills, interests)
       VALUES (?, 'Undergraduate', 'MERN Stack Developer', 'Beginner', ?, ?)
       ON DUPLICATE KEY UPDATE user_id=user_id`,
      [userId, JSON.stringify(['HTML', 'CSS']), JSON.stringify(['Web Development'])]
    );

    // Create initial progress
    await pool.query(
      `INSERT INTO progress (user_id, completed_topics, current_topic, overall_progress_percentage, weekly_study_hours, learning_streak_days, skill_progress)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE user_id=user_id`,
      [
        userId,
        JSON.stringify(['HTML Fundamentals']),
        'JavaScript Fundamentals',
        25,
        14,
        4,
        JSON.stringify([
          { skill: 'HTML', percentage: 100 },
          { skill: 'CSS', percentage: 75 },
          { skill: 'JavaScript', percentage: 40 },
          { skill: 'React', percentage: 15 },
          { skill: 'Node.js', percentage: 0 },
          { skill: 'MongoDB', percentage: 0 }
        ])
      ]
    );

    return res.status(201).json({
      success: true,
      data: {
        _id: userId,
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: 'STUDENT',
        token: generateToken(userId)
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate student & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const pool = getMySQLPool();
    if (!pool) {
      return res.status(500).json({ success: false, message: 'Database connection unavailable' });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, role, password FROM users WHERE LOWER(email) = LOWER(?)',
      [email.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    return res.json({
      success: true,
      data: {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'STUDENT',
        token: generateToken(user.id)
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const pool = getMySQLPool();
    const userId = req.user?.id || req.user?._id;

    if (pool && userId) {
      const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [userId]);
      if (rows.length > 0) {
        return res.json({
          success: true,
          data: {
            _id: rows[0].id,
            id: rows[0].id,
            name: rows[0].name,
            email: rows[0].email,
            role: rows[0].role || 'STUDENT',
            createdAt: rows[0].created_at
          }
        });
      }
    }

    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
