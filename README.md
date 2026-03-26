# TestHub — Competitive Exam Preparation Platform

A full-stack web application for competitive exam preparation featuring test series, AI-powered question generation, study materials, and detailed performance analytics.

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2.0 | UI Framework |
| Vite | 5.0.0 | Build Tool & Dev Server |
| React Router DOM | 6.20.0 | Client-side Routing |
| Framer Motion | 10.16.0 | Animations & Transitions |
| Tailwind CSS | 3.4.0 | Utility-first Styling |
| Axios | 1.6.0 | HTTP Client |
| Chart.js | 4.4.0 | Charts & Graphs |
| React Icons | 4.12.0 | Icon Library |
| TipTap | 2.1.13 | Rich Text Editor |
| XLSX | 0.18.0 | Excel File Handling |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20.20.1 | Runtime Environment |
| Express | 4.18.2 | Web Framework |
| MySQL2 | 3.6.0 | Database Driver |
| JWT | 9.0.1 | Authentication Tokens |
| Bcryptjs | 2.4.3 | Password Hashing |
| Multer | 1.4.5 | File Upload Handling |
| Google Generative AI | 0.1.3 | Gemini AI Integration |
| Nodemon | 3.0.1 | Dev Auto-restart |

### Database & Hosting
| Platform | Purpose |
|---------|---------|
| MySQL 8.0 / TiDB Cloud | Relational Database |
| Vercel | Frontend Hosting |
| Render | Backend API Hosting |
| GitHub | Version Control |

---

## Project Structure

```
test-series-platform/
│
├── frontend/
│   ├── public/
│   │   └── notes/
│   │       └── rajasthan-cet-2025/
│   │           ├── index.html
│   │           └── topics.json
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── ManageCategoriesExams.jsx
│   │   │   │   ├── TestManagement.jsx
│   │   │   │   ├── AddTest.jsx
│   │   │   │   ├── AddQuestions.jsx
│   │   │   │   ├── BulkTestImport.jsx
│   │   │   │   ├── ContentManagement.jsx
│   │   │   │   ├── ContentEditor.jsx
│   │   │   │   ├── ExamPagesManager.jsx
│   │   │   │   ├── ExamPageEditor.jsx
│   │   │   │   ├── AITestGenerator.jsx
│   │   │   │   ├── UserAnalytics.jsx
│   │   │   │   ├── BlogManager.jsx
│   │   │   │   └── ExamContentMode.jsx
│   │   │   │
│   │   │   ├── Exams/
│   │   │   │   ├── ExamDetailPage.jsx
│   │   │   │   ├── ExamContent.jsx
│   │   │   │   └── ExamContentViewer.jsx
│   │   │   │
│   │   │   ├── Blogs/
│   │   │   │   ├── BlogList.jsx
│   │   │   │   └── BlogDetail.jsx
│   │   │   │
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Tests.jsx
│   │   │   ├── TakeTest.jsx
│   │   │   ├── TestResult.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── CurrentAffairs.jsx
│   │   │   ├── NewsDetail.jsx
│   │   │   ├── AboutUs.jsx
│   │   │   ├── ContactUs.jsx
│   │   │   ├── FAQ.jsx
│   │   │   ├── TermsConditions.jsx
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   └── RefundPolicy.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
├── backend/
│   ├── config/
│   │   └── database.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tests.js
│   │   ├── admin.js
│   │   ├── examCategories.js
│   │   ├── examDetails.js
│   │   ├── blogs.js
│   │   ├── content.js
│   │   ├── examContent.js
│   │   ├── news.js
│   │   └── aiGenerator.js
│   │
│   ├── uploads/
│   │   ├── blogs/
│   │   └── exam-content/
│   │
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js v20+
- MySQL 8.0 or TiDB Cloud account
- Google Gemini API key

### 1. Clone the Repository
```bash
git clone https://github.com/askdkay/testhub.git
cd testhub
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=test_series_new
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

---

## Routes Reference

### Public Routes
| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page |
| `/exam/:slug` | ExamDetailPage | Exam details with tabs |
| `/exam/:slug/content` | ExamContentViewer | Study material viewer |
| `/blogs` | BlogList | All blog posts |
| `/blogs/:slug` | BlogDetail | Single blog post |
| `/current-affairs` | CurrentAffairs | Daily news by date |
| `/current-affairs/:id` | NewsDetail | News detail with AI summary |
| `/about` | AboutUs | About page |
| `/contact` | ContactUs | Contact page |
| `/faq` | FAQ | FAQ page |

### Protected Routes (Login Required)
| Route | Page | Description |
|-------|------|-------------|
| `/tests` | Tests | All test series |
| `/test/:id` | TakeTest | Test interface with timer |
| `/test-result/:testId` | TestResult | Results and analysis |
| `/profile` | Profile | User profile & stats |
| `/settings` | Settings | User preferences |

### Admin Routes
| Route | Page | Description |
|-------|------|-------------|
| `/admin` | Dashboard | Stats and charts |
| `/admin/students` | UserAnalytics | User management |
| `/admin/tests` | TestManagement | Manage all tests |
| `/admin/add-test` | AddTest | Create new test |
| `/admin/add-questions/:testId` | AddQuestions | Add questions |
| `/admin/bulk-import` | BulkTestImport | JSON bulk import |
| `/admin/categories-exams` | ManageCategoriesExams | Category/exam CRUD |
| `/admin/exam-pages` | ExamPagesManager | Exam page manager |
| `/admin/ai-test-generator` | AITestGenerator | AI question generation |
| `/admin/examcontentmode` | ExamContentMode | Study material manager |
| `/admin/study-material` | BlogManager | Blog manager |

---

## API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

### Tests
```
GET    /api/tests
GET    /api/tests/:id
POST   /api/tests/admin/create
PUT    /api/tests/admin/:id
DELETE /api/tests/admin/:id
```

### Exam Content (Study Material)
```
GET    /api/exam-content/topics/:examSlug
GET    /api/exam-content/subtopic/:id
GET    /api/exam-content/admin/exams
GET    /api/exam-content/admin/topics/:examId
POST   /api/exam-content/admin/topic
PUT    /api/exam-content/admin/topic/:id
DELETE /api/exam-content/admin/topic/:id
POST   /api/exam-content/admin/subtopic/upload
PUT    /api/exam-content/admin/subtopic/:id
DELETE /api/exam-content/admin/subtopic/:id
```

### Current Affairs (Auto News)
```
GET    /api/news?date=YYYY-MM-DD
GET    /api/news/dates
GET    /api/news/single/:id
POST   /api/news/fetch
```

### Blogs
```
GET    /api/blogs
GET    /api/blogs/:slug
POST   /api/blogs/admin/create
PUT    /api/blogs/admin/:id
DELETE /api/blogs/admin/:id
```

### AI Generator
```
POST   /api/ai-generator/generate
```

---

## Key Features

### For Students
- Register and login with JWT authentication
- Browse exam categories and take test series
- Real-time test interface with countdown timer
- Question palette with mark-for-review
- Detailed results with performance analysis
- Weak/strong topic identification
- Read study material with topic/subtopic navigation
- Daily current affairs with AI-powered summaries and practice MCQs
- Blog and study notes reading

### For Admins
- Dashboard with charts and user statistics
- Create and manage test series with pricing
- Add questions manually or via JSON bulk import
- AI-powered test generation using Gemini 2.5 Flash
- Study material manager — create topics, upload JSON content files
- Exam page editor with JSON/HTML dual mode
- Blog and study material management with rich text editor
- User management and analytics
- Daily news auto-fetch via cron job (12:30 AM IST)

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts and roles |
| `exam_categories` | Exam categories (Rajasthan, UPSC, Medical) |
| `exams` | Individual exams under categories |
| `tests` | Test series with settings |
| `questions` | MCQ questions linked to tests |
| `exam_topics` | Study material topics per exam |
| `exam_subtopics` | Subtopics with JSON file references |
| `current_affairs` | Auto-fetched daily news with AI study material |
| `blogs` | Blog posts and study notes |

---

## Environment Variables

### Backend `.env`
```env
PORT=5000
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=3306
JWT_SECRET=
FRONTEND_URL=
GEMINI_API_KEY=
NODE_ENV=development
```

### Frontend `.env`
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```

`vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### Backend → Render
- Build Command: `npm install`
- Start Command: `npm start`
- Add all environment variables in Render dashboard

### Database → TiDB Cloud
- Free tier: 5GB storage, 50M RU/month
- MySQL-compatible — no code changes needed
- Just update `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` in env

---

## Study Material — JSON Format

When uploading study material via Admin panel, JSON files must follow this structure:

```json
{
  "title": "Topic Title Here",
  "content": "<h2>Heading</h2><p>Content here...</p><ul><li>Point 1</li></ul>"
}
```

- `title` → automatically becomes the subtopic name
- `content` → HTML content rendered in the viewer
- Files are stored in `backend/uploads/exam-content/`
- Files are **never** stored in the database — only the file reference is saved

---

## Current Affairs — Auto System

News is automatically fetched every night at 12:30 AM IST via a cron job:

- Sources: Google News RSS feeds (7 categories)
- AI Summary: Gemini generates quick points, static GK facts, important terms, and a practice MCQ for each news item
- Storage: MySQL `current_affairs` table
- Categories: Current Affairs, Sarkari Yojana, Vigyan & Tech, Arthvyavastha, Khel, Antarrashtriya, Paryavaran

To manually trigger a fetch:
```bash
curl -X POST http://localhost:5000/api/news/fetch
```

---

## License

MIT License — feel free to use and modify for your own projects.
