const { getMySQLPool } = require('../config/mysql');

// Safe JSON parser helper
const parseJSON = (val, defaultVal = []) => {
  if (!val) return defaultVal;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaultVal;
  }
};

// @desc    Get student profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const pool = getMySQLPool();
    const userId = req.user?.id || req.user?._id;

    if (!pool) {
      return res.status(500).json({ success: false, message: 'Database connection unavailable' });
    }

    const [rows] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [userId]);

    let profile = null;

    if (rows.length > 0) {
      const p = rows[0];
      profile = {
        _id: p.id,
        id: p.id,
        user: p.user_id,
        educationLevel: p.education_level,
        careerGoal: p.career_goal,
        experienceLevel: p.experience_level,
        existingSkills: parseJSON(p.existing_skills, ['HTML', 'CSS']),
        interests: parseJSON(p.interests, ['Web Development']),
        dailyStudyHours: p.daily_study_hours,
        weeklyStudyDays: p.weekly_study_days,
        preferredLearningStyle: p.preferred_learning_style,
        updatedAt: p.updated_at
      };
    } else {
      // Default initial profile
      profile = {
        user: userId,
        educationLevel: 'Undergraduate',
        careerGoal: 'MERN Stack Developer',
        experienceLevel: 'Beginner',
        existingSkills: ['HTML', 'CSS'],
        interests: ['Web Development'],
        dailyStudyHours: 2,
        weeklyStudyDays: 5,
        preferredLearningStyle: 'Project-based'
      };
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('getProfile error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or Update student profile
// @route   PUT /api/profile
// @access  Private
const createOrUpdateProfile = async (req, res) => {
  try {
    const pool = getMySQLPool();
    const userId = req.user?.id || req.user?._id;

    if (!pool) {
      return res.status(500).json({ success: false, message: 'Database connection unavailable' });
    }

    const {
      educationLevel,
      careerGoal,
      experienceLevel,
      existingSkills,
      interests,
      dailyStudyHours,
      weeklyStudyDays,
      preferredLearningStyle
    } = req.body;

    const edu = educationLevel || 'Undergraduate';
    const goal = careerGoal || 'MERN Stack Developer';
    const exp = experienceLevel || 'Beginner';
    const skillsJSON = JSON.stringify(Array.isArray(existingSkills) ? existingSkills : ['HTML', 'CSS']);
    const interestsJSON = JSON.stringify(Array.isArray(interests) ? interests : ['Web Development']);
    const dailyHours = Number(dailyStudyHours) || 2;
    const weeklyDays = Number(weeklyStudyDays) || 5;
    const style = preferredLearningStyle || 'Project-based';

    await pool.query(
      `INSERT INTO student_profiles (user_id, education_level, career_goal, experience_level, existing_skills, interests, daily_study_hours, weekly_study_days, preferred_learning_style)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         education_level = VALUES(education_level),
         career_goal = VALUES(career_goal),
         experience_level = VALUES(experience_level),
         existing_skills = VALUES(existing_skills),
         interests = VALUES(interests),
         daily_study_hours = VALUES(daily_study_hours),
         weekly_study_days = VALUES(weekly_study_days),
         preferred_learning_style = VALUES(preferred_learning_style),
         updated_at = CURRENT_TIMESTAMP`,
      [userId, edu, goal, exp, skillsJSON, interestsJSON, dailyHours, weeklyDays, style]
    );

    const [rows] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [userId]);
    const p = rows[0];

    const updatedProfile = {
      _id: p.id,
      id: p.id,
      user: p.user_id,
      educationLevel: p.education_level,
      careerGoal: p.career_goal,
      experienceLevel: p.experience_level,
      existingSkills: parseJSON(p.existing_skills, []),
      interests: parseJSON(p.interests, []),
      dailyStudyHours: p.daily_study_hours,
      weeklyStudyDays: p.weekly_study_days,
      preferredLearningStyle: p.preferred_learning_style,
      updatedAt: p.updated_at
    };

    return res.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('createOrUpdateProfile error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProfile,
  createOrUpdateProfile
};
