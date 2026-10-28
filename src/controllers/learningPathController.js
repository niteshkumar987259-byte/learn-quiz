const { getMySQLPool } = require('../config/mysql');
const { analyzeSkillGaps, generateLearningRoadmap, fallbackGenerateRoadmap } = require('../services/aiService');

const parseJSON = (val, defaultVal = []) => {
  if (!val) return defaultVal;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaultVal;
  }
};

// @desc    Generate personalized learning path
// @route   POST /api/learning-path/generate
// @access  Private
const generatePath = async (req, res) => {
  try {
    const pool = getMySQLPool();
    const userId = req.user?.id || req.user?._id;

    if (!pool) {
      return res.status(500).json({ success: false, message: 'Database connection unavailable' });
    }

    // Fetch profile
    let profile = null;
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

    // Fetch assessment result
    let assessmentResult = null;
    const [aRows] = await pool.query('SELECT * FROM assessment_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId]);
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

    const skillGaps = await analyzeSkillGaps(profile, assessmentResult);
    const roadmapJSON = await generateLearningRoadmap(profile, assessmentResult, skillGaps);

    await pool.query(
      `INSERT INTO learning_paths (user_id, goal, summary, estimated_duration, phases, status)
       VALUES (?, ?, ?, ?, ?, 'active')
       ON DUPLICATE KEY UPDATE
         goal = VALUES(goal),
         summary = VALUES(summary),
         estimated_duration = VALUES(estimated_duration),
         phases = VALUES(phases),
         status = 'active',
         updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        roadmapJSON.goal,
        roadmapJSON.summary,
        roadmapJSON.estimatedDuration,
        JSON.stringify(roadmapJSON.phases || [])
      ]
    );

    const [lpRows] = await pool.query('SELECT * FROM learning_paths WHERE user_id = ?', [userId]);
    const lp = lpRows[0];

    const learningPath = {
      _id: lp.id,
      id: lp.id,
      user: lp.user_id,
      goal: lp.goal,
      summary: lp.summary,
      estimatedDuration: lp.estimated_duration,
      phases: parseJSON(lp.phases, []),
      status: lp.status,
      updatedAt: lp.updated_at
    };

    return res.status(201).json({
      success: true,
      message: 'Personalized Learning Path generated successfully',
      data: learningPath
    });
  } catch (error) {
    console.error('Generate path error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user learning path
// @route   GET /api/learning-path
// @access  Private
const getLearningPath = async (req, res) => {
  try {
    const pool = getMySQLPool();
    const userId = req.user?.id || req.user?._id;

    let learningPath = null;

    if (pool && userId) {
      const [rows] = await pool.query('SELECT * FROM learning_paths WHERE user_id = ?', [userId]);
      if (rows.length > 0) {
        const lp = rows[0];
        learningPath = {
          _id: lp.id,
          id: lp.id,
          user: lp.user_id,
          goal: lp.goal,
          summary: lp.summary,
          estimatedDuration: lp.estimated_duration,
          phases: parseJSON(lp.phases, []),
          status: lp.status,
          updatedAt: lp.updated_at
        };
      }
    }

    if (!learningPath) {
      const fallback = fallbackGenerateRoadmap({ careerGoal: 'MERN Stack Developer' });
      learningPath = {
        user: userId,
        goal: fallback.goal,
        summary: fallback.summary,
        estimatedDuration: fallback.estimatedDuration,
        phases: fallback.phases,
        status: 'active'
      };
    }

    res.json({ success: true, data: learningPath });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update topic status (complete / toggle)
// @route   PUT /api/learning-path/update-topic-status
// @access  Private
const updateTopicStatus = async (req, res) => {
  try {
    const { topicName, isCompleted } = req.body;
    const pool = getMySQLPool();
    const userId = req.user?.id || req.user?._id;

    let learningPath = null;

    if (pool && userId) {
      const [rows] = await pool.query('SELECT * FROM learning_paths WHERE user_id = ?', [userId]);
      if (rows.length > 0) {
        const lp = rows[0];
        learningPath = {
          _id: lp.id,
          id: lp.id,
          user: lp.user_id,
          goal: lp.goal,
          summary: lp.summary,
          estimatedDuration: lp.estimated_duration,
          phases: parseJSON(lp.phases, []),
          status: lp.status
        };
      }
    }

    if (!learningPath) {
      const fallback = fallbackGenerateRoadmap({ careerGoal: 'MERN Stack Developer' });
      learningPath = {
        user: userId,
        goal: fallback.goal,
        summary: fallback.summary,
        estimatedDuration: fallback.estimatedDuration,
        phases: fallback.phases,
        status: 'active'
      };
    }

    let totalTopics = 0;
    let completedCount = 0;

    learningPath.phases.forEach((phase) => {
      if (phase.topics && Array.isArray(phase.topics)) {
        phase.topics.forEach((t) => {
          totalTopics++;
          if (t.name && t.name.toLowerCase() === (topicName || '').toLowerCase()) {
            t.isCompleted = isCompleted;
            if (isCompleted) t.completedAt = Date.now();
          }
          if (t.isCompleted) completedCount++;
        });
      }
    });

    if (pool && userId) {
      await pool.query(
        `INSERT INTO learning_paths (user_id, goal, summary, estimated_duration, phases, status)
         VALUES (?, ?, ?, ?, ?, 'active')
         ON DUPLICATE KEY UPDATE
           phases = VALUES(phases),
           updated_at = CURRENT_TIMESTAMP`,
        [
          userId,
          learningPath.goal,
          learningPath.summary,
          learningPath.estimatedDuration,
          JSON.stringify(learningPath.phases)
        ]
      );
    }

    const overallPct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

    res.json({
      success: true,
      message: `Topic ${topicName} updated to ${isCompleted ? 'Completed' : 'Incomplete'}`,
      overallProgressPercentage: overallPct,
      data: learningPath
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generatePath,
  getLearningPath,
  updateTopicStatus
};
