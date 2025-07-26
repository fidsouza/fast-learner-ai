# Fast Learner AI - Language Learning Platform

A modern language learning platform featuring audio-text synchronization, vocabulary management, and AI-powered content generation for English and French.

## 🚀 Features

### ✅ Core Functionality
- **Complete Authentication** (registration, login, logout) via Supabase
- **Lesson Import** with text and optional audio files
- **Integrated Audio Player** with playback controls
- **Audio-Text Synchronization** (framework ready)
- **Vocabulary Management** with status tracking (new/learning/known)
- **Word & Sentence Selection** - Save individual words or complete sentences
- **AI Content Generation** with user-provided OpenAI keys
- **Automatic Translation** for vocabulary items
- **Responsive Design** with Tailwind CSS

### 🤖 AI Features (User-Key Powered)
- **AI Text Generation** with GPT-4 for custom lessons
- **Text-to-Speech** audio generation
- **Smart Translation** for vocabulary building
- **Difficulty Levels** (beginner, intermediate, advanced)
- **Topic-based Content** generation

### 🔒 Security & Privacy
- **User-Managed API Keys** - No server-side OpenAI keys required
- **Temporary Key Storage** - Keys stored only in browser session
- **Row Level Security** in database
- **Secure File Storage** with Supabase

## 🏗️ Technology Stack

- **Backend**: Node.js + TypeScript + Express
- **Frontend**: React.js + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: OpenAI API (user-provided keys)
- **Deployment**: Docker + Docker Compose

## 📁 Project Structure

```
fast-learner-ai/
├── backend/                    # Node.js API
│   ├── src/
│   │   ├── controllers/        # API Controllers
│   │   ├── middleware/         # Auth & Error middleware
│   │   ├── routes/            # API Routes
│   │   ├── services/          # AI & Translation services
│   │   └── types/             # TypeScript interfaces
│   ├── package.json
│   └── Dockerfile
├── frontend/                   # React Application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/            # Application pages
│   │   ├── services/         # API & Supabase clients
│   │   ├── store/            # State management (Zustand)
│   │   └── utils/            # Helper utilities
│   ├── package.json
│   └── Dockerfile
├── database/                   # Database schemas & migrations
│   ├── schema.sql             # Main database schema
│   ├── add_sentence_support.sql
│   ├── ai_metadata_extension.sql
│   └── add_difficulty_levels.sql
├── docker-compose.yml         # Development environment
├── .env.example              # Environment variables template
└── API_KEY_SETUP.md          # AI setup documentation
```

## 🛠️ Quick Setup

### Prerequisites
- **Docker & Docker Compose** (recommended) OR Node.js 18+
- **Supabase Account** (free tier available)
- **OpenAI Account** (for AI features - users provide their own keys)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd fast-learner-ai
```

### 2. Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Go to **SQL Editor** and run all scripts in `/database/` folder in this order:
   ```sql
   -- 1. First run schema.sql
   -- 2. Then run add_sentence_support.sql  
   -- 3. Then run ai_metadata_extension.sql
   -- 4. Finally run add_difficulty_levels.sql
   ```
3. Go to **Settings > API** and copy your keys

### 3. Environment Configuration

Create `.env` file in the root directory:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Application
PORT=3001
NODE_ENV=development

# Frontend Environment
REACT_APP_API_URL=http://localhost:3001
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Launch Application

#### Option A: Docker (Recommended)
```bash
# Build and start all services
docker-compose up --build

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

#### Option B: Local Development
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm install
npm start
```

## 📖 User Guide

### 1. Getting Started
1. Open http://localhost:3000
2. Create an account or login
3. Choose your learning language (English or French)

### 2. AI Configuration (Required for AI Features)
1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click **Settings** dropdown in navbar
3. Select **Configure OpenAI Key**
4. Enter your API key and save
5. Key is stored temporarily in your browser session

### 3. Creating Lessons

#### Manual Lesson Creation
1. Go to Dashboard → **New Lesson**
2. Add title and text content
3. Optionally upload an audio file
4. Save lesson

#### AI-Generated Lessons
1. Navigate to **AI Generation** page
2. Select language and difficulty level
3. Optionally specify a topic
4. Click **Generate** to create content with audio
5. Review and save the lesson

### 4. Studying Lessons
1. Click on any lesson from your dashboard
2. Use audio player (if available)
3. **Save Words**: Double-click any word
4. **Save Sentences**: Select text by dragging, then click "Save Sentence" button
5. Set vocabulary status (new/learning/known)

### 5. Vocabulary Management
1. Go to **Vocabulary** page
2. Filter by status, language, or item type (words vs sentences)
3. Update word status as you progress
4. Search through your saved vocabulary

## 🔧 API Documentation

### Authentication
All API endpoints require Bearer token authentication via Supabase JWT.

### AI Endpoints (Require User API Key)
```http
# Generate Text
POST /api/lessons/ai/generate-text
Authorization: Bearer <jwt_token>
X-OpenAI-API-Key: <user_openai_key>
Content-Type: application/json

{
  "language": "english",
  "topic": "travel", 
  "level": "beginner"
}

# Generate Complete Lesson
POST /api/lessons/ai/generate-lesson
Authorization: Bearer <jwt_token>
X-OpenAI-API-Key: <user_openai_key>
Content-Type: application/json

{
  "language": "french",
  "topic": "food",
  "level": "intermediate",
  "title": "French Cuisine Basics"
}

# Translate Text
POST /api/vocabulary/translate
Authorization: Bearer <jwt_token>
X-OpenAI-API-Key: <user_openai_key>
Content-Type: application/json

{
  "text": "Hello world",
  "sourceLanguage": "english"
}
```

### Standard Endpoints
```http
# Get Lessons
GET /api/lessons
Authorization: Bearer <jwt_token>

# Create Lesson
POST /api/lessons
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

# Vocabulary Management
GET /api/vocabulary
POST /api/vocabulary  
PUT /api/vocabulary/:id/status
```

## 🚀 Deployment Guide

### Production Environment Variables
```bash
# Production Supabase
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_KEY=your-prod-service-key

# Production API
PORT=3001
NODE_ENV=production

# Frontend (build-time)
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_SUPABASE_URL=https://your-prod-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-prod-anon-key
```

### Recommended Deployment Platforms

#### Frontend
- **Vercel** (recommended)
- **Netlify** 
- **AWS S3 + CloudFront**

#### Backend
- **Railway** (recommended)
- **Heroku**
- **DigitalOcean App Platform**
- **AWS ECS/Fargate**

#### Database
- **Supabase** (managed PostgreSQL)

### Storage Configuration
Ensure your Supabase storage bucket `audio-files` has proper policies:

```sql
-- Enable storage uploads for authenticated users
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-files');

-- Enable file access for authenticated users  
CREATE POLICY "Authenticated users can access files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'audio-files');
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] OpenAI API key configuration
- [ ] Manual lesson creation with audio
- [ ] AI lesson generation
- [ ] Word selection and vocabulary saving
- [ ] Sentence selection and saving
- [ ] Vocabulary filtering and management
- [ ] Audio playback functionality
- [ ] Translation features

### API Testing
Use the provided examples in `/test_ai_generation.md` to test AI endpoints.

## 🔐 Security Considerations

### User API Key Management
- Keys are stored only in browser sessionStorage
- Keys are transmitted via secure HTTPS headers
- No server-side storage of user API keys
- Users are responsible for their own OpenAI costs

### Database Security
- Row Level Security (RLS) enabled
- Users can only access their own data
- Authenticated-only access to all resources

### File Uploads
- Secure file storage in Supabase
- File type validation
- Size limitations enforced

## 🛣️ Roadmap

### Short Term
- [ ] Enhanced audio-text synchronization
- [ ] Improved mobile responsiveness
- [ ] Better error handling and user feedback
- [ ] Performance optimizations

### Medium Term  
- [ ] Multi-language support (Spanish, German, etc.)
- [ ] Advanced AI features (speech recognition)
- [ ] Social features (sharing lessons)
- [ ] Progress tracking and analytics

### Long Term
- [ ] Mobile apps (React Native)
- [ ] Offline functionality (PWA)
- [ ] Advanced spaced repetition system
- [ ] Community marketplace for lessons

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues

**AI Features Not Working**
- Ensure you've configured your OpenAI API key in Settings
- Check that your OpenAI account has sufficient credits
- Verify your API key is valid and not expired

**Database Errors**
- Ensure all SQL migrations have been run in order
- Check Supabase project settings and RLS policies
- Verify environment variables are correct

**File Upload Issues**
- Check Supabase storage bucket policies
- Ensure file types and sizes are within limits
- Verify authentication tokens are valid

### Getting Help
- Check the `/API_KEY_SETUP.md` for detailed AI configuration
- Review database migration files for schema details
- Use browser developer tools to debug frontend issues
- Check Docker logs for backend troubleshooting

---

**Built with ❤️ using React, Node.js, and Supabase**