const { getMySQLPool } = require('../config/mysql');
const { analyzeSkillGaps, aiTutorChat } = require('../services/aiService');

const parseJSON = (val, defaultVal = []) => {
  if (!val) return defaultVal;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaultVal;
  }
};

// @desc    Interactive AI Tutor Q&A
// @route   POST /api/ai/tutor
// @access  Private
const tutorChat = async (req, res) => {
  try {
    const { query, currentTopic, chatHistory } = req.body;
    const pool = getMySQLPool();
    const userId = req.user?.id || req.user?._id;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a question for the AI Tutor' });
    }

    let careerGoal = 'MERN Stack Developer';

    if (pool && userId) {
      const [rows] = await pool.query('SELECT career_goal FROM student_profiles WHERE user_id = ?', [userId]);
      if (rows.length > 0 && rows[0].career_goal) {
        careerGoal = rows[0].career_goal;
      }
    }

    const tutorResponse = await aiTutorChat({
      query,
      careerGoal,
      currentTopic: currentTopic || 'JavaScript Fundamentals',
      chatHistory: chatHistory || []
    });

    res.json({
      success: true,
      data: tutorResponse
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Analyze student skills via AI
// @route   POST /api/ai/analyze-skills
// @access  Private
const analyzeSkillsEndpoint = async (req, res) => {
  try {
    const pool = getMySQLPool();
    const userId = req.user?.id || req.user?._id;

    let profile = null;
    let assessmentResult = null;

    if (pool && userId) {
      const [pRows] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [userId]);
      if (pRows.length > 0) {
        const p = pRows[0];
        profile = {
          educationLevel: p.education_level,
          careerGoal: p.career_goal,
          experienceLevel: p.experience_level,
          existingSkills: parseJSON(p.existing_skills, ['HTML', 'CSS']),
          interests: parseJSON(p.interests, ['Web Development']),
          dailyStudyHours: p.daily_study_hours,
          weeklyStudyDays: p.weekly_study_days,
          preferredLearningStyle: p.preferred_learning_style
        };
      }

      const [aRows] = await pool.query(
        'SELECT * FROM assessment_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      if (aRows.length > 0) {
        const a = aRows[0];
        assessmentResult = {
          careerGoal: a.career_goal,
          totalScore: a.total_score,
          percentage: a.percentage,
          skillBreakdown: parseJSON(a.skill_breakdown, []),
          strongSkills: parseJSON(a.strong_skills, []),
          improvementSkills: parseJSON(a.improvement_skills, []),
          missingSkills: parseJSON(a.missing_skills, [])
        };
      }
    }

    const analysis = await analyzeSkillGaps(profile, assessmentResult);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  tutorChat,
  analyzeSkillsEndpoint
};
