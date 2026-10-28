You are a senior full-stack engineer and UI/UX designer. Build a production-quality web application called "PathAI", an AI-based Personalized Learning Path Generator. It has TWO panels: a Student Panel and an Admin Panel. The app tests a student with questions, analyzes the answers with AI, finds strengths and weak areas, and generates a personalized step-by-step learning path that updates as the student improves.

==================================================
1. TECH STACK
==================================================
- Frontend: React + TypeScript + Vite, Tailwind CSS, shadcn/ui, Recharts for charts, Framer Motion for subtle animations, React Router, React Query
- Backend: Node.js + Express (or Next.js API routes) with REST APIs
- Database: PostgreSQL with Prisma ORM (or Supabase)
- Auth: JWT with role-based access control (roles: STUDENT, ADMIN)
- AI: Anthropic Claude API called from the backend only (never expose the API key to the frontend). Use structured JSON outputs with validation (zod).
- Add .env.example, seed script (demo admin + 5 demo students + 100 sample questions), and README with setup steps.

==================================================
2. USER ROLES AND AUTH
==================================================
- Landing page, Login, Register (student), Forgot password
- Role-based redirect: Student -> /student/dashboard, Admin -> /admin/dashboard
- Protected routes, session expiry, logout
- Demo credentials: admin@pathai.com / Admin@123, student@pathai.com / Student@123

==================================================
3. STUDENT PANEL
==================================================
3.1 Onboarding (first login, 4 steps)
- Select goal (e.g. exam prep, school subject, skill building, job prep)
- Select subject(s) and class/level
- Choose daily study time (15 / 30 / 60 / 120 min) and target date
- Choose learning style (visual, reading, practice-based, video)

3.2 Diagnostic Test
- AI-adaptive quiz: difficulty goes up after correct answers and down after wrong ones
- Question types: MCQ, true/false, short answer (AI-graded)
- Timer per question, progress bar, flag-for-review, one question at a time
- Track per answer: correct/incorrect, time taken, confidence level (low/medium/high selected by student), attempts
- Auto-save progress so a student can resume

3.3 AI Answer Analysis (core feature)
After each test the backend sends the answer data to the AI and returns structured JSON containing:
- overall_score and mastery_level per topic (0-100)
- strengths (topics) and weak_areas (topics)
- error_pattern analysis: conceptual mistake, careless mistake, time-pressure mistake, guessing (from confidence vs correctness and time taken)
- skill_gap_summary in simple language
- explanation for each wrong answer with the correct concept
- recommended_difficulty for next stage
Show this on a "Result and Analysis" page with:
- Radar chart (topic mastery), bar chart (time per question), donut chart (correct/wrong/skipped)
- "Strengths" and "Needs Improvement" cards
- Expandable per-question review with AI explanation

3.4 Personalized Learning Path
- AI generates a roadmap: an ordered list of modules, each containing topics, estimated time, difficulty, resources (video/article/practice set/flashcards), a practice quiz and a milestone
- Weak topics come first, with prerequisites ordered correctly
- Fit the plan to the student's daily time and target date (weekly schedule view)
- Visual: vertical timeline / roadmap with locked, in-progress and completed states
- After completing a module, run a short check quiz; the path automatically re-plans (skip mastered topics, add revision for failed ones)
- "Why this step?" button explaining the AI's reasoning

3.5 Other student pages
- Dashboard: today's tasks, current streak, XP/badges, overall progress ring, next recommended step, weekly study-hours chart
- My Progress: topic-wise mastery trend over time (line chart), test history
- Practice Zone: AI-generated practice questions on any weak topic on demand
- AI Tutor chat: ask doubts, answered in context of the student's weak topics
- Profile and Settings: edit goals, subjects, notification preferences, dark/light mode
- Notifications: reminders, new recommendations, achievements

==================================================
4. ADMIN PANEL
==================================================
4.1 Admin Dashboard
- KPI cards: total students, active today, tests taken, average score, path completion rate
- Charts: signups over time, average mastery by subject, most-failed topics, engagement heatmap

4.2 Student Management
- Searchable, filterable table (subject, level, status) with pagination
- Student detail page: profile, test history, weak/strong topics, current learning path, activity log
- Actions: activate/deactivate, reset path, assign a manual path, export student report (PDF/CSV)

4.3 Question Bank Management
- CRUD for questions: subject, topic, subtopic, difficulty (1-5), type, options, correct answer, explanation, tags
- Bulk CSV import/export
- "Generate with AI" button: admin enters a topic and difficulty, AI drafts questions, admin reviews and approves before publishing
- Question status: draft / approved / archived

4.4 Content and Curriculum Management
- Manage subjects, topics, and the prerequisite graph between topics
- Attach learning resources (video link, article, PDF) to topics
- Create reusable learning-path templates

4.5 AI Settings and Monitoring
- Edit AI prompt templates (analysis prompt, path-generation prompt), with version history and a test sandbox
- Configure difficulty algorithm parameters, number of questions per test, and passing mastery threshold (e.g. 70%)
- View AI request logs, token usage and errors; flag poor AI outputs for review

4.6 Analytics and Reports
- Topic difficulty analysis (which questions are too hard or too easy)
- Cohort comparison, learning effectiveness (pre vs post improvement)
- Downloadable reports (CSV/PDF)

4.7 System
- Admin user management with roles, audit log, announcements to students

==================================================
5. AI LOGIC (backend)
==================================================
Endpoint 1: POST /api/ai/analyze-test
Input: student profile, list of {question_id, topic, difficulty, student_answer, correct_answer, is_correct, time_taken, confidence}
Output (strict JSON):
{
  "overall_score": number,
  "topic_mastery": [{"topic": string, "score": number, "level": "weak|average|strong"}],
  "strengths": [string],
  "weak_areas": [string],
  "error_patterns": [{"type": "conceptual|careless|time_pressure|guessing", "topics": [string], "evidence": string}],
  "skill_gap_summary": string,
  "question_feedback": [{"question_id": string, "explanation": string}],
  "recommended_difficulty": 1-5
}

Endpoint 2: POST /api/ai/generate-path
Input: analysis result, goal, daily time, target date, learning style, topic prerequisite graph
Output (strict JSON):
{
  "path_title": string,
  "total_weeks": number,
  "modules": [{
    "order": number, "title": string, "topics": [string], "difficulty": 1-5,
    "estimated_minutes": number, "why_this_step": string,
    "resources": [{"type": "video|article|practice|flashcards", "title": string, "url": string}],
    "check_quiz_topic": string, "milestone": string
  }],
  "weekly_schedule": [{"week": number, "days": [{"day": string, "tasks": [string]}]}]
}

Endpoint 3: POST /api/ai/practice-questions, POST /api/ai/tutor-chat, POST /api/ai/replan-path

Rules: validate all AI output with zod; retry once on invalid JSON; use a rule-based fallback path generator if the AI fails; cache results; add rate limiting; never trust AI output blindly; keep student data private.

==================================================
6. DATABASE SCHEMA (Prisma models)
==================================================
User, StudentProfile, Subject, Topic, TopicPrerequisite, Question, Test, TestAttempt, AttemptAnswer, AnalysisResult, LearningPath, PathModule, ModuleProgress, Resource, Badge, UserBadge, Notification, AiLog, PromptTemplate, AuditLog. Include proper relations, indexes and timestamps.

==================================================
7. UI/UX DESIGN SYSTEM (professional, modern)
==================================================
- Style: clean SaaS dashboard, similar to Linear/Notion/Coursera quality; lots of white space, rounded-2xl cards, soft shadows
- Colors: primary indigo (#4F46E5), secondary teal (#14B8A6), accent amber (#F59E0B), success green, danger red; neutral slate grays; full dark mode
- Typography: Inter; clear hierarchy (32/24/18/14px)
- Layout: left collapsible sidebar + top bar (search, notifications, profile menu); student panel uses a friendly, colorful style, admin panel uses a denser, data-focused style
- Components: stat cards, data tables with sorting and filters, tabs, modals, toasts, skeleton loaders, empty states, progress rings, timeline roadmap, badges
- Fully responsive (mobile, tablet, desktop), accessible (WCAG AA, keyboard navigation, aria labels)
- Micro-animations on page load, chart reveal and module completion (confetti on milestones)
- Landing page with hero, feature sections, how-it-works (3 steps), testimonials and CTA

==================================================
8. NON-FUNCTIONAL REQUIREMENTS
==================================================
- Input validation, XSS/CSRF protection, password hashing (bcrypt), rate limiting, CORS config
- Error handling and loading states on every page
- Clean folder structure (client/ and server/), reusable components, typed APIs
- Unit tests for the scoring and path-ordering logic
- Seed data so every screen looks populated on first run

==================================================
9. DELIVERABLES / BUILD ORDER
==================================================
Step 1: Project structure, DB schema, seed data
Step 2: Auth and role-based routing
Step 3: Admin question bank and curriculum
Step 4: Student onboarding and diagnostic test
Step 5: AI analysis endpoint and Results page
Step 6: AI path generation and roadmap UI
Step 7: Dashboards, progress, practice, tutor chat
Step 8: Admin analytics, AI settings, reports
Step 9: Polish UI, responsive, dark mode, tests, README

Start by showing the folder structure and Prisma schema, then build step by step. Write complete working code for every file, with no placeholders or "TODO".
