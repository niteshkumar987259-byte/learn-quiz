const { getMySQLPool } = require('../config/mysql');
const { quizzesData } = require('../utils/seedData');

const parseJSON = (val, defaultVal = []) => {
  if (!val) return defaultVal;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaultVal;
  }
};

// @desc    Get quiz questions for a topic
// @route   GET /api/quiz/:topicName
// @access  Private
const getQuizByTopic = async (req, res) => {
  try {
    const { topicName } = req.params;
    const pool = getMySQLPool();

    let quiz = null;

    if (pool) {
      const [rows] = await pool.query('SELECT * FROM quizzes WHERE LOWER(topic_name) = LOWER(?)', [
        topicName.trim()
      ]);
      if (rows.length > 0) {
        quiz = {
          topicName: rows[0].topic_name,
          questions: parseJSON(rows[0].questions, [])
        };
      }
    }

    if (!quiz) {
      const fallback = quizzesData.find(
        (q) => q.topicName.toLowerCase() === topicName.toLowerCase()
      ) || {
        topicName,
        questions: [
          {
            questionId: 'default-q1',
            question: `Which concept is fundamental to mastering ${topicName}?`,
            options: [
              'Understanding data flow and component hierarchy',
              'Direct memory allocation',
              'Ignoring error handling',
              'Manual garbage collection'
            ],
            correctAnswer: 0,
            explanation: `Understanding data flow and state hierarchy is essential for ${topicName}.`
          },
          {
            questionId: 'default-q2',
            question: `What is the primary benefit of testing your knowledge in ${topicName}?`,
            options: [
              'Decreases learning retention',
              'Identifies skill gaps and reinforces concepts',
              'Increases code complexity',
              'Prevents API calls'
            ],
            correctAnswer: 1,
            explanation: 'Quizzes evaluate retention and trigger targeted learning path re-adjustments.'
          }
        ]
      };
      quiz = fallback;
    }

    const clientQuestions = (quiz.questions || []).map((q) => ({
      questionId: q.questionId,
      question: q.question,
      options: q.options
    }));

    res.json({
      success: true,
      topicName: quiz.topicName,
      questions: clientQuestions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit quiz, score answers, and trigger Adaptive Learning Path re-adjustment
// @route   POST /api/quiz/:topicName/submit
// @access  Private
const submitQuiz = async (req, res) => {
  try {
    const { topicName } = req.params;
    const { userAnswers } = req.body;
    const pool = getMySQLPool();
    const userId = req.user?.id || req.user?._id;

    let quiz = null;

    if (pool) {
      const [rows] = await pool.query('SELECT * FROM quizzes WHERE LOWER(topic_name) = LOWER(?)', [
        topicName.trim()
      ]);
      if (rows.length > 0) {
        quiz = {
          topicName: rows[0].topic_name,
          questions: parseJSON(rows[0].questions, [])
        };
      }
    }

    if (!quiz) {
      const fallback = quizzesData.find((q) => q.topicName.toLowerCase() === topicName.toLowerCase());
      quiz = fallback || {
        topicName,
        questions: [
          { questionId: 'default-q1', correctAnswer: 0 },
          { questionId: 'default-q2', correctAnswer: 1 }
        ]
      };
    }

    let correct = 0;
    const total = quiz.questions.length || 1;

    (quiz.questions || []).forEach((q) => {
      const ans = userAnswers ? userAnswers[q.questionId] : undefined;
      if (ans !== undefined && Number(ans) === q.correctAnswer) {
        correct++;
      }
    });

    const percentage = Math.round((correct / total) * 100);
    const passed = percentage >= 60;

    let aiRecommendation = '';
    let feedback = '';

    if (percentage >= 85) {
      feedback = 'Outstanding performance! You demonstrate strong mastery.';
      aiRecommendation = `Score = ${percentage}%. Fast-tracking: You are cleared to accelerate directly to advanced modules!`;
    } else if (percentage >= 60) {
      feedback = 'Good job! You passed the quiz and can proceed to the next module.';
      aiRecommendation = `Score = ${percentage}%. Recommending continuation to the next structured prerequisite topic.`;
    } else {
      feedback = 'Your understanding of key concepts needs improvement before moving forward.';
      aiRecommendation = `Score = ${percentage}%. Adaptive Adjustment: Recommending additional revision and targeted practice exercise for ${topicName} before unlocking subsequent topics.`;
    }

    if (pool && userId) {
      await pool.query(
        `INSERT INTO quiz_results (user_id, topic_name, score, total_questions, percentage, feedback, ai_recommendation)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, topicName, correct, total, percentage, feedback, aiRecommendation]
      );
    }

    res.json({
      success: true,
      data: {
        score: correct,
        totalQuestions: total,
        percentage,
        passed,
        feedback,
        aiRecommendation
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getQuizByTopic,
  submitQuiz
};
