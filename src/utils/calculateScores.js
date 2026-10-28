/**
 * Transparent scoring system for Skill Assessment
 * 0–30% → Beginner
 * 31–60% → Basic
 * 61–80% → Intermediate
 * 81–100% → Advanced
 */
const calculateSkillLevel = (percentage) => {
  if (percentage <= 30) return 'Beginner';
  if (percentage <= 60) return 'Basic';
  if (percentage <= 80) return 'Intermediate';
  return 'Advanced';
};

const evaluateAssessment = (userAnswers, questions) => {
  let totalCorrect = 0;
  const skillStats = {};

  questions.forEach((q) => {
    const skillName = q.skill;
    if (!skillStats[skillName]) {
      skillStats[skillName] = { correct: 0, total: 0 };
    }
    skillStats[skillName].total += 1;

    const userAnswerIndex = userAnswers[q.questionId];
    if (userAnswerIndex !== undefined && Number(userAnswerIndex) === q.correctAnswer) {
      totalCorrect += 1;
      skillStats[skillName].correct += 1;
    }
  });

  const totalQuestions = questions.length;
  const totalPercentage = Math.round((totalCorrect / totalQuestions) * 100);

  const skillBreakdown = Object.keys(skillStats).map((skill) => {
    const stat = skillStats[skill];
    const pct = Math.round((stat.correct / stat.total) * 100);
    return {
      skill,
      score: stat.correct,
      total: stat.total,
      percentage: pct,
      level: calculateSkillLevel(pct)
    };
  });

  const strongSkills = skillBreakdown
    .filter((s) => s.level === 'Advanced' || s.level === 'Intermediate')
    .map((s) => s.skill);

  const improvementSkills = skillBreakdown
    .filter((s) => s.level === 'Basic' || s.level === 'Beginner')
    .map((s) => s.skill);

  return {
    totalScore: totalCorrect,
    totalQuestions,
    percentage: totalPercentage,
    skillBreakdown,
    strongSkills,
    improvementSkills
  };
};

module.exports = {
  calculateSkillLevel,
  evaluateAssessment
};
