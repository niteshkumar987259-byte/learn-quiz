const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const skillsData = [
  { name: 'HTML', category: 'Frontend', description: 'HyperText Markup Language' },
  { name: 'CSS', category: 'Frontend', description: 'Cascading Style Sheets & Layouts' },
  { name: 'JavaScript', category: 'Frontend', description: 'Core JS, ES6+, Async & Closures' },
  { name: 'DOM & Web APIs', category: 'Frontend', description: 'DOM manipulation and Fetch API' },
  { name: 'React', category: 'Frontend', description: 'Components, State, Hooks & Router' },
  { name: 'Node.js', category: 'Backend', description: 'Event Loop, File System & Modules' },
  { name: 'Express.js', category: 'Backend', description: 'REST APIs, Middleware & Routing' },
  { name: 'MongoDB', category: 'Database', description: 'NoSQL Databases, Schemas & Aggregation' },
  { name: 'Python', category: 'Data Analysis', description: 'Syntax, Data Structures & OOP' },
  { name: 'Pandas & NumPy', category: 'Data Analysis', description: 'Data Manipulation & Analysis' },
  { name: 'SQL', category: 'Database', description: 'Relational Queries, Joins & Aggregations' }
];

const topicsData = [
  {
    name: 'HTML Fundamentals',
    skillName: 'HTML',
    category: 'Frontend',
    difficulty: 'Beginner',
    estimatedHours: 2,
    prerequisites: [],
    description: 'Master semantic HTML elements, forms, input types, and accessible page structure.',
    learningObjectives: [
      'Understand semantic tag layout',
      'Create interactive HTML forms and validations',
      'Understand document structure and meta metadata'
    ],
    resources: [
      { title: 'MDN HTML Basics', type: 'Documentation', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML', estimatedTime: '45 mins' },
      { title: 'HTML5 Semantic Guide', type: 'Article', url: 'https://web.dev/learn/html/semantic-html/', estimatedTime: '30 mins' }
    ],
    practiceExercise: {
      title: 'Build a Registration Form',
      instructions: 'Create a semantic form with inputs for Name, Email, Password, and a Submit button.',
      starterCode: '<form>\n  <!-- Add your code here -->\n</form>'
    },
    miniProject: {
      title: 'Personal Portfolio Landing Page',
      description: 'Build a full pure-HTML portfolio page with header, nav links, about section, and contact form.',
      requirements: ['Semantic tags', 'Functional form fields', 'Clean structure']
    }
  },
  {
    name: 'CSS Styling & Flexbox',
    skillName: 'CSS',
    category: 'Frontend',
    difficulty: 'Basic',
    estimatedHours: 4,
    prerequisites: ['HTML Fundamentals'],
    description: 'Learn box model, selectors, CSS variables, Flexbox layouts, and Grid positioning.',
    learningObjectives: [
      'Master the CSS Box Model (margin, padding, border)',
      'Design responsive card layouts using Flexbox',
      'Use CSS variables for theme customization'
    ],
    resources: [
      { title: 'CSS Tricks Complete Guide to Flexbox', type: 'Article', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', estimatedTime: '40 mins' },
      { title: 'MDN CSS Layouts', type: 'Documentation', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout', estimatedTime: '45 mins' }
    ],
    practiceExercise: {
      title: 'Flexbox Pricing Cards',
      instructions: 'Create 3 responsive pricing cards side by side using display: flex.',
      starterCode: '.card-container {\n  display: flex;\n}'
    },
    miniProject: {
      title: 'Responsive Dashboard Shell',
      description: 'Style a responsive landing navbar and hero section.',
      requirements: ['Flexbox navbar', 'Hover effects', 'Media queries for mobile']
    }
  },
  {
    name: 'JavaScript Fundamentals',
    skillName: 'JavaScript',
    category: 'Frontend',
    difficulty: 'Beginner',
    estimatedHours: 6,
    prerequisites: ['HTML Fundamentals', 'CSS Styling & Flexbox'],
    description: 'Master JS variables, data types, control flow, functions, arrow functions, and scope.',
    learningObjectives: [
      'Understand function declarations vs arrow functions',
      'Master parameters, scope, and return values',
      'Work with array methods like map, filter, and reduce'
    ],
    resources: [
      { title: 'javascript.info - Modern JavaScript Tutorial', type: 'Documentation', url: 'https://javascript.info/first-steps', estimatedTime: '60 mins' },
      { title: 'JS Fundamentals Guide', type: 'Article', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions', estimatedTime: '40 mins' }
    ],
    practiceExercise: {
      title: 'Function Practice',
      instructions: 'Write a function calculateDiscount(price, percentage) that returns the final price.',
      starterCode: 'function calculateDiscount(price, percentage) {\n  // Write code here\n}'
    },
    miniProject: {
      title: 'Simple Calculator App',
      description: 'Create a JavaScript calculator function that performs add, subtract, multiply, and divide operations.',
      requirements: ['Arrow functions', 'Input validation', 'Returns result']
    }
  },
  {
    name: 'DOM & Async JavaScript',
    skillName: 'DOM & Web APIs',
    category: 'Frontend',
    difficulty: 'Intermediate',
    estimatedHours: 5,
    prerequisites: ['JavaScript Fundamentals'],
    description: 'Learn event listeners, DOM manipulation, Promises, Async/Await, and Fetch API.',
    learningObjectives: [
      'Dynamically update HTML DOM elements using JS',
      'Handle click, input, and submit events',
      'Fetch asynchronous data from REST APIs using async/await'
    ],
    resources: [
      { title: 'Fetch API Guide', type: 'Documentation', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch', estimatedTime: '40 mins' }
    ],
    practiceExercise: {
      title: 'Fetch Weather Data',
      instructions: 'Write an async function fetchUser() that retrieves data from a public API.',
      starterCode: 'async function fetchUser() {\n  // Add fetch call\n}'
    },
    miniProject: {
      title: 'Live Task Board Application',
      description: 'Build a dynamic task app where users can add, delete, and check off tasks with DOM manipulation.',
      requirements: ['Event handlers', 'DOM creation', 'Local storage persistence']
    }
  },
  {
    name: 'React Core & State Management',
    skillName: 'React',
    category: 'Frontend',
    difficulty: 'Intermediate',
    estimatedHours: 8,
    prerequisites: ['DOM & Async JavaScript'],
    description: 'Master JSX, functional components, props, useState, useEffect, and component lifecycle.',
    learningObjectives: [
      'Understand component-based UI architecture',
      'Manage component state with useState',
      'Perform API side effects with useEffect'
    ],
    resources: [
      { title: 'Official React Docs - Learn React', type: 'Documentation', url: 'https://react.dev/learn', estimatedTime: '60 mins' }
    ],
    practiceExercise: {
      title: 'Counter Component',
      instructions: 'Create a React Counter component with Increment and Decrement buttons.',
      starterCode: 'export default function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}'
    },
    miniProject: {
      title: 'Interactive E-Commerce Product Catalog',
      description: 'Build a product list app with state filtering, search bar, and shopping cart counter.',
      requirements: ['useState & useEffect hooks', 'Reusable components', 'Props passing']
    }
  },
  {
    name: 'Node.js & Express Fundamentals',
    skillName: 'Express.js',
    category: 'Backend',
    difficulty: 'Intermediate',
    estimatedHours: 6,
    prerequisites: ['JavaScript Fundamentals'],
    description: 'Learn Node.js runtime, NPM packages, Express router, HTTP methods, and custom middleware.',
    learningObjectives: [
      'Build Express.js REST API endpoints (GET, POST, PUT, DELETE)',
      'Implement request validation and custom middleware',
      'Understand JSON body parsing and error handling'
    ],
    resources: [
      { title: 'Express.js Getting Started Guide', type: 'Documentation', url: 'https://expressjs.com/en/starter/installing.html', estimatedTime: '45 mins' }
    ],
    practiceExercise: {
      title: 'Create POST Route',
      instructions: 'Define an Express POST route /api/users that logs and returns req.body.',
      starterCode: 'app.post("/api/users", (req, res) => {\n  res.json(req.body);\n});'
    },
    miniProject: {
      title: 'RESTful Note Taking API',
      description: 'Create an Express backend server with full CRUD endpoints for managing study notes.',
      requirements: ['Express Router', 'Middleware', 'Error handler']
    }
  },
  {
    name: 'MongoDB & Mongoose Database',
    skillName: 'MongoDB',
    category: 'Database',
    difficulty: 'Intermediate',
    estimatedHours: 6,
    prerequisites: ['Node.js & Express Fundamentals'],
    description: 'Learn NoSQL data modeling, Mongoose collections, schemas, references, and CRUD queries.',
    learningObjectives: [
      'Design MongoDB document schemas with Mongoose',
      'Connect Node.js to MongoDB Atlas or local database',
      'Perform database querying, filtering, and indexing'
    ],
    resources: [
      { title: 'Mongoose Docs Quick Start', type: 'Documentation', url: 'https://mongoosejs.com/docs/', estimatedTime: '45 mins' }
    ],
    practiceExercise: {
      title: 'Mongoose User Schema',
      instructions: 'Create a Mongoose schema for User with name, email, and createdAt.',
      starterCode: 'const userSchema = new mongoose.Schema({ name: String });'
    },
    miniProject: {
      title: 'Database Integrated API',
      description: 'Connect your Express API to MongoDB to persist user profiles and learning records.',
      requirements: ['MongoDB connection', 'Mongoose schema validation', 'Query methods']
    }
  },
  {
    name: 'Full Stack MERN Capstone Project',
    skillName: 'React',
    category: 'Frontend',
    difficulty: 'Advanced',
    estimatedHours: 12,
    prerequisites: ['React Core & State Management', 'MongoDB & Mongoose Database'],
    description: 'Build a production-ready full stack MERN web application with JWT authentication and state synchronization.',
    learningObjectives: [
      'Integrate React frontend with Express/MongoDB REST backend',
      'Implement JWT token authentication flow',
      'Deploy full stack application'
    ],
    resources: [
      { title: 'MERN Stack Guide', type: 'Article', url: 'https://www.mongodb.com/mern-stack', estimatedTime: '60 mins' }
    ],
    practiceExercise: {
      title: 'Axios Authorization Header',
      instructions: 'Set up Axios default request headers with Bearer JWT token.',
      starterCode: 'axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;'
    },
    miniProject: {
      title: 'Full Stack Learning Path Generator',
      description: 'Final full stack capstone application integrating React client, Express API, MongoDB database, and AI.',
      requirements: ['JWT Auth', 'Mongoose models', 'Vite React UI', 'AI API integration']
    }
  }
];

const assessmentsData = [
  {
    careerGoal: 'MERN Stack Developer',
    questions: [
      {
        questionId: 'q1',
        question: 'Which HTML tag is used for the primary header of a web page?',
        options: ['<header>', '<h1>', '<head>', '<top>'],
        correctAnswer: 1,
        skill: 'HTML',
        difficulty: 'Beginner'
      },
      {
        questionId: 'q2',
        question: 'How do you center an item horizontally using CSS Flexbox on a parent container?',
        options: ['align-items: center;', 'justify-content: center;', 'text-align: center;', 'margin: auto;'],
        correctAnswer: 1,
        skill: 'CSS',
        difficulty: 'Basic'
      },
      {
        questionId: 'q3',
        question: 'Which method creates a new array populated with the results of calling a function on every element?',
        options: ['forEach()', 'map()', 'filter()', 'reduce()'],
        correctAnswer: 1,
        skill: 'JavaScript',
        difficulty: 'Beginner'
      },
      {
        questionId: 'q4',
        question: 'What is the output of typeof null in JavaScript?',
        options: ['"null"', '"undefined"', '"object"', '"number"'],
        correctAnswer: 2,
        skill: 'JavaScript',
        difficulty: 'Intermediate'
      },
      {
        questionId: 'q5',
        question: 'Which React Hook is primarily used for handling side-effects like data fetching?',
        options: ['useState', 'useReducer', 'useEffect', 'useCallback'],
        correctAnswer: 2,
        skill: 'React',
        difficulty: 'Intermediate'
      },
      {
        questionId: 'q6',
        question: 'In Express.js, what is the third parameter (next) passed to a middleware function used for?',
        options: ['To send HTTP response', 'To pass control to the next middleware', 'To terminate the request', 'To parse JSON'],
        correctAnswer: 1,
        skill: 'Express.js',
        difficulty: 'Intermediate'
      },
      {
        questionId: 'q7',
        question: 'Which MongoDB command/method finds all documents matching a condition?',
        options: ['Model.get()', 'Model.find()', 'Model.select()', 'Model.query()'],
        correctAnswer: 1,
        skill: 'MongoDB',
        difficulty: 'Basic'
      }
    ]
  },
  {
    careerGoal: 'Data Analyst',
    questions: [
      {
        questionId: 'dq1',
        question: 'Which SQL keyword is used to filter records in a aggregate query after GROUP BY?',
        options: ['WHERE', 'HAVING', 'ORDER BY', 'FILTER'],
        correctAnswer: 1,
        skill: 'SQL',
        difficulty: 'Intermediate'
      },
      {
        questionId: 'dq2',
        question: 'In Python Pandas, how do you read a CSV file into a DataFrame?',
        options: ['pd.open_csv()', 'pd.read_csv()', 'pd.load_csv()', 'pd.DataFrame.csv()'],
        correctAnswer: 1,
        skill: 'Pandas & NumPy',
        difficulty: 'Beginner'
      }
    ]
  }
];

const quizzesData = [
  {
    topicName: 'JavaScript Fundamentals',
    questions: [
      {
        questionId: 'jq1',
        question: 'What is the difference between let and const in JavaScript?',
        options: [
          'let allows reassignment, const does not allow reassignment',
          'const allows reassignment, let does not',
          'Both are identical',
          'const is globally scoped only'
        ],
        correctAnswer: 0,
        explanation: 'const creates a read-only reference to a value, so it cannot be reassigned after initialization.'
      },
      {
        questionId: 'jq2',
        question: 'What does a function return if no explicit return statement is provided?',
        options: ['null', '0', 'undefined', 'false'],
        correctAnswer: 2,
        explanation: 'In JavaScript, functions without an explicit return statement implicitly return undefined.'
      },
      {
        questionId: 'jq3',
        question: 'How do you call a function named calculateSum with arguments 5 and 10?',
        options: ['call calculateSum(5, 10)', 'calculateSum(5, 10)', 'calculateSum[5, 10]', 'run calculateSum(5, 10)'],
        correctAnswer: 1,
        explanation: 'Functions are invoked using parentheses with arguments passed inside.'
      }
    ]
  },
  {
    topicName: 'React Core & State Management',
    questions: [
      {
        questionId: 'rq1',
        question: 'What happens when state is updated via the setter function returned by useState?',
        options: [
          'The browser page reloads',
          'React re-renders the component with updated state',
          'Nothing happens until manually triggered',
          'The state resets to default'
        ],
        correctAnswer: 1,
        explanation: 'Updating state schedules a re-render of the React component tree.'
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    const { connectMySQL } = require('../config/mysql');
    const { initializeDatabase } = require('../config/initDb');

    await connectMySQL();
    await initializeDatabase();
    console.log('✅ Aiven MySQL database successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, skillsData, topicsData, assessmentsData, quizzesData };
