const { getMySQLPool } = require('../config/mysql');
const { evaluateAssessment } = require('../utils/calculateScores');
const { assessmentsData } = require('../utils/seedData');

const parseJSON = (val, defaultVal = []) => {
  if (!val) return defaultVal;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaultVal;
  }
};

// @desc    Get diagnostic assessment questions by career goal
// @route   GET /api/assessment/questions
// @access  Private
const getQuestions = async (req, res) => {
  try {
    const goal = (req.query.goal || 'MERN Stack Developer').trim();
    const pool = getMySQLPool();

    let assessment = null;

    if (pool) {
      const [rows] = await pool.query('SELECT * FROM assessments WHERE LOWER(career_goal) = LOWER(?)', [goal]);
      if (rows.length > 0) {
        assessment = {
          careerGoal: rows[0].career_goal,
          questions: parseJSON(rows[0].questions, [])
        };
      }
    }

    if (!assessment) {
      const foundSeed = assessmentsData.find((a) => a.careerGoal.toLowerCase() === goal.toLowerCase());
      assessment = foundSeed || assessmentsData[0];
    }

    const clientQuestions = (assessment.questions || []).map((q) => ({
      questionId: q.questionId,
      question: q.question,
      options: q.options,
      skill: q.skill,
      difficulty: q.difficulty
    }));

    res.json({
      success: true,
      careerGoal: assessment.careerGoal,
      count: clientQuestions.length,
      questions: clientQuestions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit assessment answers, calculate scores & store result
// @route   POST /api/assessment/submit
// @access  Private
const submitAssessment = async (req, res) => {
  try {
    const { careerGoal, userAnswers } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!userAnswers) {
      return res.status(400).json({ success: false, message: 'Please provide user answers' });
    }

    const goal = (careerGoal || 'MERN Stack Developer').trim();
    const pool = getMySQLPool();

    let assessment = null;
    if (pool) {
      const [rows] = await pool.query('SELECT * FROM assessments WHERE LOWER(career_goal) = LOWER(?)', [goal]);
      if (rows.length > 0) {
        assessment = {
          careerGoal: rows[0].career_goal,
          questions: parseJSON(rows[0].questions, [])
        };
      }
    }

    if (!assessment) {
      const foundSeed = assessmentsData.find((a) => a.careerGoal.toLowerCase() === goal.toLowerCase());
      assessment = foundSeed || assessmentsData[0];
    }

    const evaluation = evaluateAssessment(userAnswers, assessment.questions);
    const missingSkills = ['React', 'Node.js', 'Express.js', 'MongoDB'];

    const resultData = {
      user: userId,
      careerGoal: goal,
      totalScore: evaluation.totalScore,
      totalQuestions: evaluation.totalQuestions,
      percentage: evaluation.percentage,
      skillBreakdown: evaluation.skillBreakdown,
      strongSkills: evaluation.strongSkills,
      improvementSkills: evaluation.improvementSkills,
      missingSkills,
      createdAt: Date.now()
    };

    if (pool) {
      const [insertResult] = await pool.query(
        `INSERT INTO assessment_results (user_id, career_goal, total_score, total_questions, percentage, skill_breakdown, strong_skills, improvement_skills, missing_skills)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          goal,
          evaluation.totalScore,
          evaluation.totalQuestions,
          evaluation.percentage,
          JSON.stringify(evaluation.skillBreakdown || []),
          JSON.stringify(evaluation.strongSkills || []),
          JSON.stringify(evaluation.improvementSkills || []),
          JSON.stringify(missingSkills)
        ]
      );
      resultData._id = insertResult.insertId;
      resultData.id = insertResult.insertId;
    }

    return res.status(201).json({
      success: true,
      message: 'Assessment completed successfully',
      data: resultData
    });
  } catch (error) {
    console.error('submitAssessment error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recent assessment results
// @route   GET /api/assessment/results
// @access  Private
const getAssessmentResults = async (req, res) => {
  try {
    const pool = getMySQLPool();
    const userId = req.user?.id || req.user?._id;

    let result = null;

    if (pool && userId) {
      const [rows] = await pool.query(
        'SELECT * FROM assessment_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
      );

      if (rows.length > 0) {
        const r = rows[0];
        result = {
          _id: r.id,
          id: r.id,
          user: r.user_id,
          careerGoal: r.career_goal,
          totalScore: r.total_score,
          totalQuestions: r.total_questions,
          percentage: r.percentage,
          skillBreakdown: parseJSON(r.skill_breakdown, []),
          strongSkills: parseJSON(r.strong_skills, []),
          improvementSkills: parseJSON(r.improvement_skills, []),
          missingSkills: parseJSON(r.missing_skills, []),
          createdAt: r.created_at
        };
      }
    }

    if (!result) {
      result = {
        careerGoal: 'MERN Stack Developer',
        totalScore: 4,
        totalQuestions: 7,
        percentage: 57,
        skillBreakdown: [
          { skill: 'HTML', score: 1, total: 1, percentage: 100, level: 'Advanced' },
          { skill: 'CSS', score: 1, total: 1, percentage: 100, level: 'Advanced' },
          { skill: 'JavaScript', score: 1, total: 2, percentage: 50, level: 'Basic' },
          { skill: 'React', score: 0, total: 1, percentage: 0, level: 'Beginner' },
          { skill: 'Express.js', score: 1, total: 1, percentage: 100, level: 'Advanced' },
          { skill: 'MongoDB', score: 0, total: 1, percentage: 0, level: 'Beginner' }
        ],
        strongSkills: ['HTML', 'CSS', 'Express.js'],
        improvementSkills: ['JavaScript'],
        missingSkills: ['React', 'MongoDB']
      };
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getQuestions,
  submitAssessment,
  getAssessmentResults
};
