const { getMySQLPool } = require('../config/mysql');
const { topicsData } = require('../utils/seedData');

const parseJSON = (val, defaultVal = []) => {
  if (!val) return defaultVal;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    return defaultVal;
  }
};

/**
 * Ensures learning path topics respect prerequisite dependency graph
 */
const enforcePrerequisites = async (candidateTopics) => {
  let allTopics = [];
  const pool = getMySQLPool();

  if (pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM topics ORDER BY id ASC');
      allTopics = rows.map((t) => ({
        name: t.name,
        skillName: t.skill_name,
        difficulty: t.difficulty,
        prerequisites: parseJSON(t.prerequisites, []),
        description: t.description,
        concepts: parseJSON(t.concepts, []),
        practiceTasks: parseJSON(t.practice_tasks, []),
        resources: parseJSON(t.resources, [])
      }));
    } catch (err) {
      allTopics = [];
    }
  }

  if (!allTopics || allTopics.length === 0) {
    allTopics = topicsData;
  }

  const topicMap = new Map();
  allTopics.forEach((t) => topicMap.set(t.name.toLowerCase(), t));

  const orderedList = [];
  const added = new Set();

  // Helper to add topic and all its prerequisites recursively
  const addTopicWithPrereqs = (topicName) => {
    const key = topicName.toLowerCase();
    const tDoc = topicMap.get(key);
    if (!tDoc) return;

    if (tDoc.prerequisites && tDoc.prerequisites.length > 0) {
      tDoc.prerequisites.forEach((pName) => {
        if (!added.has(pName.toLowerCase())) {
          addTopicWithPrereqs(pName);
        }
      });
    }

    if (!added.has(key)) {
      added.add(key);
      orderedList.push(tDoc);
    }
  };

  candidateTopics.forEach((tName) => {
    addTopicWithPrereqs(tName);
  });

  return orderedList;
};

module.exports = {
  enforcePrerequisites
};
