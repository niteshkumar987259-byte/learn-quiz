const { getMySQLPool } = require('./mysql');
const { topicsData, skillsData, assessmentsData, quizzesData } = require('../utils/seedData');

const initializeDatabase = async () => {
  const pool = getMySQLPool();
  if (!pool) {
    console.error('Cannot initialize MySQL tables: pool is not active.');
    return;
  }

  try {
    // 1. Users table with role
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        role VARCHAR(20) DEFAULT 'STUDENT',
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Check if role column exists (for existing tables)
    const [cols] = await pool.query("SHOW COLUMNS FROM users LIKE 'role'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'STUDENT' AFTER email");
      console.log('✅ Added role column to users table.');
    }

    // 2. Student Profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        education_level VARCHAR(100) DEFAULT 'Undergraduate',
        career_goal VARCHAR(255) DEFAULT 'MERN Stack Developer',
        experience_level VARCHAR(100) DEFAULT 'Beginner',
        existing_skills JSON,
        interests JSON,
        daily_study_hours INT DEFAULT 2,
        weekly_study_days INT DEFAULT 5,
        preferred_learning_style VARCHAR(100) DEFAULT 'Project-based',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Topics table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS topics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        skill_name VARCHAR(255),
        difficulty VARCHAR(50),
        prerequisites JSON,
        description TEXT,
        concepts JSON,
        practice_tasks JSON,
        resources JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Skills table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(100),
        description TEXT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Assessments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        career_goal VARCHAR(255) NOT NULL UNIQUE,
        questions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Assessment Results table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessment_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        career_goal VARCHAR(255),
        total_score INT DEFAULT 0,
        total_questions INT DEFAULT 0,
        percentage INT DEFAULT 0,
        skill_breakdown JSON,
        strong_skills JSON,
        improvement_skills JSON,
        missing_skills JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_assessment (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Learning Paths table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS learning_paths (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        goal VARCHAR(255),
        summary TEXT,
        estimated_duration VARCHAR(100),
        phases JSON,
        status VARCHAR(50) DEFAULT 'active',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_lp (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Quizzes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        topic_name VARCHAR(255) NOT NULL UNIQUE,
        questions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 9. Quiz Results table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        topic_name VARCHAR(255),
        score INT DEFAULT 0,
        total_questions INT DEFAULT 0,
        percentage INT DEFAULT 0,
        feedback TEXT,
        ai_recommendation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_quiz (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 10. Progress table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        completed_topics JSON,
        current_topic VARCHAR(255),
        overall_progress_percentage INT DEFAULT 0,
        weekly_study_hours INT DEFAULT 0,
        learning_streak_days INT DEFAULT 1,
        skill_progress JSON,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_progress (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Aiven MySQL Schema & Tables verified/created successfully.');

    // Seed default catalog data if tables are empty
    await seedMySQLCatalogs(pool);

  } catch (error) {
    console.error('❌ Failed initializing MySQL schema:', error.message);
  }
};

const seedMySQLCatalogs = async (pool) => {
  try {
    // Seed Topics
    const [topicRows] = await pool.query('SELECT COUNT(*) as count FROM topics');
    if (topicRows[0].count === 0 && topicsData?.length > 0) {
      for (const t of topicsData) {
        await pool.query(
          `INSERT INTO topics (name, skill_name, difficulty, prerequisites, description, concepts, practice_tasks, resources)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=name`,
          [
            t.name,
            t.skillName || null,
            t.difficulty || 'Beginner',
            JSON.stringify(t.prerequisites || []),
            t.description || '',
            JSON.stringify(t.concepts || []),
            JSON.stringify(t.practiceTasks || []),
            JSON.stringify(t.resources || [])
          ]
        );
      }
      console.log(`🌱 Seeded ${topicsData.length} topics into Aiven MySQL.`);
    }

    // Seed Skills
    const [skillRows] = await pool.query('SELECT COUNT(*) as count FROM skills');
    if (skillRows[0].count === 0 && skillsData?.length > 0) {
      for (const s of skillsData) {
        await pool.query(
          `INSERT INTO skills (name, category, description)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE name=name`,
          [s.name, s.category || '', s.description || '']
        );
      }
      console.log(`🌱 Seeded ${skillsData.length} skills into Aiven MySQL.`);
    }

    // Seed Assessments
    const [assessmentRows] = await pool.query('SELECT COUNT(*) as count FROM assessments');
    if (assessmentRows[0].count === 0 && assessmentsData?.length > 0) {
      for (const a of assessmentsData) {
        await pool.query(
          `INSERT INTO assessments (career_goal, questions)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE career_goal=career_goal`,
          [a.careerGoal, JSON.stringify(a.questions || [])]
        );
      }
      console.log(`🌱 Seeded ${assessmentsData.length} diagnostic assessments into Aiven MySQL.`);
    }

    // Seed Quizzes
    const [quizRows] = await pool.query('SELECT COUNT(*) as count FROM quizzes');
    if (quizRows[0].count === 0 && quizzesData?.length > 0) {
      for (const q of quizzesData) {
        await pool.query(
          `INSERT INTO quizzes (topic_name, questions)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE topic_name=topic_name`,
          [q.topicName, JSON.stringify(q.questions || [])]
        );
      }
      console.log(`🌱 Seeded ${quizzesData.length} topic quizzes into Aiven MySQL.`);
    }

    // Seed Demo Users (Admin & Student)
    const bcrypt = require('bcryptjs');
    const adminPass = await bcrypt.hash('Admin@123', 10);
    const studentPass = await bcrypt.hash('Student@123', 10);

    await pool.query(
      `INSERT INTO users (name, email, role, password)
       VALUES ('PathAI Administrator', 'admin@pathai.com', 'ADMIN', ?)
       ON DUPLICATE KEY UPDATE role='ADMIN'`,
      [adminPass]
    );

    const [studentResult] = await pool.query(
      `INSERT INTO users (name, email, role, password)
       VALUES ('Alex Mercer', 'student@pathai.com', 'STUDENT', ?)
       ON DUPLICATE KEY UPDATE role='STUDENT'`,
      [studentPass]
    );

    console.log('🌱 Seeded Demo Users: admin@pathai.com (Admin@123) & student@pathai.com (Student@123)');

  } catch (seedErr) {
    console.error('Warning during MySQL catalog seeding:', seedErr.message);
  }
};

module.exports = { initializeDatabase };
