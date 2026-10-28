const { getMySQLPool } = require('../config/mysql');

const parseJSON = (val, defaultVal = []) => {
  if (!val) return defaultVal;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaultVal;
  }
};

// @desc    Get user progress metrics for Recharts & dashboard
// @route   GET /api/progress
// @access  Private
const getProgress = async (req, res) => {
  try {
    const pool = getMySQLPool();
    const userId = req.user?.id || req.user?._id;

    let progress = null;
    let careerGoal = 'MERN Stack Developer';
    let estimatedDuration = '10 weeks';

    if (pool && userId) {
      // Get progress
      const [progRows] = await pool.query('SELECT * FROM progress WHERE user_id = ?', [userId]);
      if (progRows.length > 0) {
        const p = progRows[0];
        progress = {
          _id: p.id,
          id: p.id,
          user: p.user_id,
          completedTopics: parseJSON(p.completed_topics, ['HTML Fundamentals']),
          currentTopic: p.current_topic || 'JavaScript Fundamentals',
          overallProgressPercentage: p.overall_progress_percentage || 25,
          weeklyStudyHours: p.weekly_study_hours || 14,
          learningStreakDays: p.learning_streak_days || 4,
          skillProgress: parseJSON(p.skill_progress, [])
        };
      }

      // Get profile for careerGoal
      const [profRows] = await pool.query('SELECT career_goal FROM student_profiles WHERE user_id = ?', [userId]);
      if (profRows.length > 0 && profRows[0].career_goal) {
        careerGoal = profRows[0].career_goal;
      }

      // Get learning path for estimatedDuration
      const [lpRows] = await pool.query('SELECT estimated_duration FROM learning_paths WHERE user_id = ?', [userId]);
      if (lpRows.length > 0 && lpRows[0].estimated_duration) {
        estimatedDuration = lpRows[0].estimated_duration;
      }
    }

    if (!progress) {
      progress = {
        user: userId,
        completedTopics: ['HTML Fundamentals'],
        currentTopic: 'JavaScript Fundamentals',
        overallProgressPercentage: 25,
        weeklyStudyHours: 14,
        learningStreakDays: 4,
        skillProgress: [
          { skill: 'HTML', percentage: 100 },
          { skill: 'CSS', percentage: 75 },
          { skill: 'JavaScript', percentage: 40 },
          { skill: 'React', percentage: 15 },
          { skill: 'Node.js', percentage: 0 },
          { skill: 'MongoDB', percentage: 0 }
        ]
      };
    }

    res.json({
      success: true,
      data: {
        ...progress,
        careerGoal,
        estimatedDuration
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Log study time or update streak
// @route   POST /api/progress
// @access  Private
const updateProgress = async (req, res) => {
  try {
    const { additionalHours } = req.body;
    const pool = getMySQLPool();
    const userId = req.user?.id || req.user?._id;

    let currentHours = 14;

    if (pool && userId) {
      const [rows] = await pool.query('SELECT weekly_study_hours FROM progress WHERE user_id = ?', [userId]);
      if (rows.length > 0) {
        currentHours = rows[0].weekly_study_hours || 0;
      }

      const newHours = currentHours + (Number(additionalHours) || 1);

      await pool.query(
        `INSERT INTO progress (user_id, completed_topics, current_topic, overall_progress_percentage, weekly_study_hours, learning_streak_days, skill_progress)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           weekly_study_hours = ?,
           updated_at = CURRENT_TIMESTAMP`,
        [
          userId,
          JSON.stringify(['HTML Fundamentals']),
          'JavaScript Fundamentals',
          25,
          newHours,
          4,
          JSON.stringify([]),
          newHours
        ]
      );

      const [updatedRows] = await pool.query('SELECT * FROM progress WHERE user_id = ?', [userId]);
      const p = updatedRows[0];

      return res.json({
        success: true,
        data: {
          _id: p.id,
          id: p.id,
          user: p.user_id,
          completedTopics: parseJSON(p.completed_topics, []),
          currentTopic: p.current_topic,
          overallProgressPercentage: p.overall_progress_percentage,
          weeklyStudyHours: p.weekly_study_hours,
          learningStreakDays: p.learning_streak_days,
          skillProgress: parseJSON(p.skill_progress, [])
        }
      });
    }

    res.json({ success: true, message: 'Progress updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProgress,
  updateProgress
};
