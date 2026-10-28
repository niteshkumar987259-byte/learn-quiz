const { GoogleGenerativeAI } = require('@google/generative-ai');
const { topicsData } = require('../utils/seedData');

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(apiKey);
}

// Fallback Skill Gap Analysis
const fallbackAnalyzeSkillGaps = (profile, assessmentResult) => {
  const goal = profile?.careerGoal || 'MERN Stack Developer';
  const existing = (profile?.existingSkills || []).map((s) => s.toUpperCase());

  const strongSkills = [];
  const improvementSkills = [];
  const missingSkills = [];

  const requiredMern = ['HTML', 'CSS', 'JAVASCRIPT', 'REACT', 'NODE.JS', 'EXPRESS.JS', 'MONGODB'];

  requiredMern.forEach((skill) => {
    if (existing.includes(skill)) {
      if (skill === 'HTML' || skill === 'CSS') {
        strongSkills.push(skill);
      } else {
        improvementSkills.push(skill);
      }
    } else {
      missingSkills.push(skill);
    }
  });

  return {
    goal,
    summary: `Skill analysis for ${goal}: Strong in ${strongSkills.join(', ') || 'Basics'}, needs practice in ${improvementSkills.join(', ') || 'Core JS'}, missing ${missingSkills.join(', ')}.`,
    strongSkills: strongSkills.length > 0 ? strongSkills : ['HTML'],
    improvementSkills: improvementSkills.length > 0 ? improvementSkills : ['JavaScript'],
    missingSkills: missingSkills.length > 0 ? missingSkills : ['React', 'Node.js', 'Express.js', 'MongoDB']
  };
};

// Fallback JSON Roadmap Generator
const fallbackGenerateRoadmap = (profile, assessmentResult) => {
  const goal = profile?.careerGoal || 'MERN Stack Developer';
  const dailyHours = profile?.dailyStudyHours || 2;
  const weeklyDays = profile?.weeklyStudyDays || 5;
  const totalWeeklyHours = dailyHours * weeklyDays;

  return {
    goal,
    summary: `Personalized ${goal} roadmap tailored for ${profile?.experienceLevel || 'Beginner'} level (${dailyHours}h/day, ${weeklyDays} days/week).`,
    estimatedDuration: '10 weeks',
    phases: [
      {
        phase: 1,
        title: 'Core Fundamentals & Styling',
        duration: '2 weeks',
        reason: 'Student has foundational knowledge in HTML/CSS but requires structured web layout practice.',
        topics: [
          {
            topicId: 'html-1',
            name: 'HTML Fundamentals',
            difficulty: 'Beginner',
            estimatedHours: 2,
            prerequisites: [],
            description: 'Master semantic HTML tags and page layout structure.',
            whyRecommended: 'Essential baseline required for all web development.',
            resources: [
              { title: 'MDN HTML Basics', type: 'Documentation', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML', estimatedTime: '45 mins' }
            ]
          },
          {
            topicId: 'css-1',
            name: 'CSS Styling & Flexbox',
            difficulty: 'Basic',
            estimatedHours: 4,
            prerequisites: ['HTML Fundamentals'],
            description: 'Learn modern CSS Flexbox and responsive positioning.',
            whyRecommended: 'Required to build responsive, modern interfaces.',
            resources: [
              { title: 'CSS Flexbox Guide', type: 'Article', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', estimatedTime: '40 mins' }
            ]
          }
        ]
      },
      {
        phase: 2,
        title: 'JavaScript Logic & DOM Manipulation',
        duration: '3 weeks',
        reason: 'Assessment indicates JavaScript needs improvement before learning React framework.',
        topics: [
          {
            topicId: 'js-1',
            name: 'JavaScript Fundamentals',
            difficulty: 'Beginner',
            estimatedHours: 6,
            prerequisites: ['HTML Fundamentals', 'CSS Styling & Flexbox'],
            description: 'Functions, arrow syntax, scope, arrays, and ES6+ features.',
            whyRecommended: 'Core logic required for dynamic frontend applications.',
            resources: [
              { title: 'JavaScript.info Tutorial', type: 'Documentation', url: 'https://javascript.info/first-steps', estimatedTime: '60 mins' }
            ]
          },
          {
            topicId: 'dom-1',
            name: 'DOM & Async JavaScript',
            difficulty: 'Intermediate',
            estimatedHours: 5,
            prerequisites: ['JavaScript Fundamentals'],
            description: 'Event handling, DOM updates, Promises, and Fetch API.',
            whyRecommended: 'Essential bridge to understanding component lifecycles in React.',
            resources: [
              { title: 'Fetch API Guide', type: 'Documentation', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch', estimatedTime: '40 mins' }
            ]
          }
        ]
      },
      {
        phase: 3,
        title: 'Frontend Framework & React State',
        duration: '3 weeks',
        reason: 'Target career goal is MERN Stack Developer; React is the core frontend component engine.',
        topics: [
          {
            topicId: 'react-1',
            name: 'React Core & State Management',
            difficulty: 'Intermediate',
            estimatedHours: 8,
            prerequisites: ['DOM & Async JavaScript'],
            description: 'JSX, useState, useEffect, props, and reusable UI components.',
            whyRecommended: 'Industry standard library for component state management.',
            resources: [
              { title: 'Official React Documentation', type: 'Documentation', url: 'https://react.dev/learn', estimatedTime: '60 mins' }
            ]
          }
        ]
      },
      {
        phase: 4,
        title: 'Backend API & Database Architecture',
        duration: '2 weeks',
        reason: 'Complete full-stack mastery with Node.js, Express APIs, and MongoDB database.',
        topics: [
          {
            topicId: 'express-1',
            name: 'Node.js & Express Fundamentals',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            prerequisites: ['JavaScript Fundamentals'],
            description: 'REST API routing, HTTP verbs, and middleware handling.',
            whyRecommended: 'Server-side processing required for full stack integration.',
            resources: [
              { title: 'Express.js Getting Started', type: 'Documentation', url: 'https://expressjs.com/en/starter/installing.html', estimatedTime: '45 mins' }
            ]
          },
          {
            topicId: 'mongo-1',
            name: 'MongoDB & Mongoose Database',
            difficulty: 'Intermediate',
            estimatedHours: 6,
            prerequisites: ['Node.js & Express Fundamentals'],
            description: 'NoSQL collections, schema modeling, and document CRUD.',
            whyRecommended: 'Data persistence for modern cloud applications.',
            resources: [
              { title: 'Mongoose Docs', type: 'Documentation', url: 'https://mongoosejs.com/docs/', estimatedTime: '45 mins' }
            ]
          },
          {
            topicId: 'mern-capstone',
            name: 'Full Stack MERN Capstone Project',
            difficulty: 'Advanced',
            estimatedHours: 12,
            prerequisites: ['React Core & State Management', 'MongoDB & Mongoose Database'],
            description: 'Integrated application connecting React, Express, MongoDB, and JWT Auth.',
            whyRecommended: 'Demonstrates end-to-end full stack proficiency.',
            resources: [
              { title: 'MongoDB MERN Stack Guide', type: 'Article', url: 'https://www.mongodb.com/mern-stack', estimatedTime: '60 mins' }
            ]
          }
        ]
      }
    ]
  };
};

// AI Skill Gap Analyzer via Gemini
const analyzeSkillGaps = async (profile, assessmentResult) => {
  if (!genAI) {
    return fallbackAnalyzeSkillGaps(profile, assessmentResult);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Analyze this student's skill profile and assessment results.
Goal: ${profile?.careerGoal || 'MERN Stack Developer'}
Existing Skills: ${JSON.stringify(profile?.existingSkills || [])}
Assessment Breakdown: ${JSON.stringify(assessmentResult?.skillBreakdown || [])}

Return ONLY valid JSON matching this schema:
{
  "goal": "string",
  "summary": "string",
  "strongSkills": ["string"],
  "improvementSkills": ["string"],
  "missingSkills": ["string"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return fallbackAnalyzeSkillGaps(profile, assessmentResult);
  } catch (error) {
    console.error('Gemini Skill Gap API error, using fallback:', error.message);
    return fallbackAnalyzeSkillGaps(profile, assessmentResult);
  }
};

// AI Learning Path Generator via Gemini
const generateLearningRoadmap = async (profile, assessmentResult, skillGaps) => {
  if (!genAI) {
    return fallbackGenerateRoadmap(profile, assessmentResult);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an expert AI Learning Path Architect.
Create a structured JSON learning path roadmap for a student.

Student Context:
- Career Goal: ${profile?.careerGoal || 'MERN Stack Developer'}
- Study Time: ${profile?.dailyStudyHours || 2} hours/day, ${profile?.weeklyStudyDays || 5} days/week
- Learning Preference: ${profile?.preferredLearningStyle || 'Project-based'}
- Experience Level: ${profile?.experienceLevel || 'Beginner'}
- Strong Skills: ${JSON.stringify(skillGaps?.strongSkills || [])}
- Skills Needing Improvement: ${JSON.stringify(skillGaps?.improvementSkills || [])}
- Missing Skills: ${JSON.stringify(skillGaps?.missingSkills || [])}

RULES:
1. Do NOT recommend basic HTML/CSS if the student is already Advanced in them, unless brief revision is helpful.
2. Respect prerequisites (e.g. JavaScript before React, Node before Express).
3. Return ONLY valid JSON with no markdown formatting surrounding it.

Expected JSON Structure:
{
  "goal": "string",
  "summary": "string",
  "estimatedDuration": "string",
  "phases": [
    {
      "phase": 1,
      "title": "string",
      "duration": "string",
      "reason": "string",
      "topics": [
        {
          "topicId": "string",
          "name": "string",
          "difficulty": "Beginner|Basic|Intermediate|Advanced",
          "estimatedHours": 4,
          "prerequisites": ["string"],
          "description": "string",
          "whyRecommended": "string",
          "resources": [
            {
              "title": "string",
              "type": "Video|Article|Documentation|Practice|Project",
              "url": "string",
              "estimatedTime": "string"
            }
          ]
        }
      ]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.phases && Array.isArray(parsed.phases)) {
        return parsed;
      }
    }
    return fallbackGenerateRoadmap(profile, assessmentResult);
  } catch (error) {
    console.error('Gemini Roadmap Generation API error, using fallback:', error.message);
    return fallbackGenerateRoadmap(profile, assessmentResult);
  }
};

// AI Tutor Chat via Gemini
const aiTutorChat = async ({ query, careerGoal, currentTopic, chatHistory }) => {
  if (!genAI) {
    return {
      reply: `As your AI Tutor for ${currentTopic || 'Web Development'}, I can explain concepts, provide code examples, or give practice exercises!\n\nRegarding "${query}": A core principle in ${currentTopic || 'JavaScript'} is breaking down logic into modular, readable functions.`,
      practiceQuestion: {
        question: `In ${currentTopic || 'JavaScript'}, what is the output of [1, 2, 3].map(x => x * 2)?`,
        options: ['[1, 2, 3]', '[2, 4, 6]', '6', '[1, 4, 9]'],
        correctAnswer: 1,
        explanation: '.map() returns a new array with each element multiplied by 2.'
      }
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a friendly, encouraging AI Tutor specializing in teaching ${careerGoal || 'Software Engineering'}.
The student is currently learning the topic: "${currentTopic || 'JavaScript'}".
Student question: "${query}"

Provide a clear, beginner-friendly explanation.
Return ONLY valid JSON matching this schema:
{
  "reply": "string (markdown allowed)",
  "practiceQuestion": {
    "question": "string",
    "options": ["string", "string", "string", "string"],
    "correctAnswer": 1,
    "explanation": "string"
  }
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {
      reply: `Regarding "${query}": In ${currentTopic || 'JavaScript'}, focus on step-by-step problem solving and clean syntax!`,
      practiceQuestion: null
    };
  } catch (error) {
    console.error('Gemini Tutor Error:', error.message);
    return {
      reply: `Regarding "${query}": Focus on mastering core syntax and completing hands-on exercises!`,
      practiceQuestion: null
    };
  }
};

module.exports = {
  analyzeSkillGaps,
  generateLearningRoadmap,
  aiTutorChat,
  fallbackGenerateRoadmap
};
