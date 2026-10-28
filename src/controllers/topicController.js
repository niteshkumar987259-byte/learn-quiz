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

const formatTopic = (t) => ({
  _id: t.id,
  id: t.id,
  name: t.name,
  skillName: t.skill_name,
  difficulty: t.difficulty,
  prerequisites: parseJSON(t.prerequisites, []),
  description: t.description,
  concepts: parseJSON(t.concepts, []),
  practiceTasks: parseJSON(t.practice_tasks, []),
  resources: parseJSON(t.resources, []),
  createdAt: t.created_at
});

// @desc    Get topic details by name or ID
// @route   GET /api/topics/:identifier
// @access  Private
const getTopicByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;
    const pool = getMySQLPool();

    let topic = null;

    if (pool) {
      const isNum = !isNaN(identifier);
      let rows = [];
      if (isNum) {
        [rows] = await pool.query('SELECT * FROM topics WHERE id = ? OR LOWER(name) = LOWER(?)', [
          Number(identifier),
          identifier.trim()
        ]);
      } else {
        [rows] = await pool.query('SELECT * FROM topics WHERE LOWER(name) = LOWER(?)', [identifier.trim()]);
      }

      if (rows.length > 0) {
        topic = formatTopic(rows[0]);
      }
    }

    if (!topic) {
      const cleanId = (identifier || '').toLowerCase().trim();
      const fallback =
        topicsData.find(
          (t) => t.name.toLowerCase() === cleanId || (t.skillName && t.skillName.toLowerCase() === cleanId)
        ) ||
        topicsData.find((t) => t.name.toLowerCase().includes(cleanId) || cleanId.includes(t.name.toLowerCase())) ||
        topicsData[0];

      topic = fallback;
    }

    res.json({ success: true, data: topic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all topics catalog
// @route   GET /api/topics
// @access  Private
const getAllTopics = async (req, res) => {
  try {
    const pool = getMySQLPool();
    let topics = [];

    if (pool) {
      const [rows] = await pool.query('SELECT * FROM topics ORDER BY id ASC');
      topics = rows.map(formatTopic);
    }

    if (!topics || topics.length === 0) {
      topics = topicsData;
    }

    res.json({ success: true, count: topics.length, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTopicByIdentifier,
  getAllTopics
};
