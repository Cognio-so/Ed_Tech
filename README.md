# Frontend-Backend Integration Guide

This guide explains how to set up and use the integration between the Next.js frontend and Python FastAPI backend.

## Overview

The integration connects the React-based frontend with a Python FastAPI backend that provides AI-powered functionality for:
- Assessment generation using OpenAI GPT models
- Content generation for lesson plans, worksheets, presentations, and quizzes
- AI tutoring with RAG (Retrieval-Augmented Generation) capabilities
- Media toolkit features (slides, images, videos)

## Setup Instructions

### 1. Python Backend Setup

1. Navigate to the Python backend directory:
```bash
cd python/Walid_project_test
```

2. Create a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp env_example .env
```

Edit the `.env` file and add your API keys:
```env
OPENAI_API_KEY=your_openai_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
LANGSMITH_API_KEY=your_langsmith_api_key_here
SLIDESPEAK_API_KEY=your_slidespeak_api_key_here
```

5. Start the Python backend:
```bash
python main.py
```

The backend will start on `http://localhost:8000`

### 2. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit the `.env.local` file and add:
```env
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
# Add your other environment variables (Clerk, MongoDB, etc.)
```

4. Start the frontend:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Integration Features

### 1. Assessment Builder

**Location:** `/teacher/assessment-builder`

**Features:**
- AI-powered question generation using Python backend
- Support for multiple question types (MCQ, True/False, Short Answer)
- Customizable difficulty levels and learning objectives
- Assessment saving and management
- Direct integration with Python `assessment.py` module

**Usage:**
1. Fill in the basic assessment information
2. Configure AI generation settings
3. Click "Generate Questions with AI"
4. Review and save the generated assessment

### 2. Content Generation

**Location:** `/teacher/content-generation`

**Features:**
- AI-powered content creation for lesson plans, worksheets, presentations, and quizzes
- Advanced settings for instructional depth and content version
- Emotional considerations for student engagement
- Content saving and management
- Direct integration with Python `teaching_content_generation.py` module

**Usage:**
1. Choose content type (lesson plan, worksheet, presentation, quiz)
2. Configure content settings (grade, subject, topic)
3. Optionally configure advanced AI settings
4. Click "Generate Content with AI"
5. Review, copy, export, or save the generated content

### 3. AI Tutoring (Chat Interface)

**Features:**
- RAG-based AI tutoring with document upload
- Conversation history management
- Web search integration for up-to-date information
- File upload support for knowledge base building
- Direct integration with Python `AI_tutor.py` module

### 4. Media Toolkit

**Location:** `/teacher/media-toolkit`

**Features:**
- Slide generation (integrated with SlideSpeak API)
- Image generation capabilities
- Video creation tools
- Web content curation
- Comics and animation creation

## API Endpoints

### Backend API Endpoints (Python FastAPI)

- `POST /assessment_endpoint` - Generate assessments
- `POST /teaching_content_endpoint` - Generate teaching content
- `POST /chatbot_endpoint` - AI tutoring chat
- `GET /docs` - API documentation (Swagger UI)

### Frontend API Routes (Next.js)

- `POST /api/assessments/generate` - Generate assessments via Python backend
- `GET/POST/DELETE /api/assessments` - Manage assessments in database
- `POST /api/content/generate` - Generate content via Python backend
- `GET/DELETE /api/content` - Manage content in database
- `POST /api/chatbot` - Chat with AI tutor via Python backend

## Data Flow

1. **User Input:** User fills out forms in the frontend
2. **API Call:** Frontend makes API call to Next.js API routes
3. **Transform:** Next.js API transforms frontend data to Python backend schema
4. **Python Processing:** Python backend processes request using AI models
5. **Response:** Python backend returns generated content
6. **Save:** Next.js API saves content to MongoDB database
7. **Display:** Frontend displays generated content to user

## Troubleshooting

### Common Issues

1. **Connection Refused Error:**
   - Ensure Python backend is running on `http://localhost:8000`
   - Check the `NEXT_PUBLIC_PYTHON_API_URL` environment variable

2. **API Key Errors:**
   - Verify all required API keys are set in the Python backend `.env` file
   - Check OpenAI API key has sufficient credits

3. **CORS Issues:**
   - The Python backend includes CORS middleware for frontend communication
   - Ensure frontend is running on the expected port

4. **Database Connection Issues:**
   - Verify MongoDB connection string in frontend
   - Ensure MongoDB is running and accessible

### Logs and Debugging

- **Python Backend Logs:** Check the console where you started `python main.py`
- **Frontend Logs:** Check browser console and Next.js development server console
- **API Response Debugging:** Use browser network tab to inspect API calls

## Environment Variables Summary

### Python Backend (.env)
```env
OPENAI_API_KEY=your_openai_api_key
TAVILY_API_KEY=your_tavily_api_key
LANGSMITH_API_KEY=your_langsmith_api_key
SLIDESPEAK_API_KEY=your_slidespeak_api_key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## Next Steps

1. **Enhanced Error Handling:** Implement more robust error handling and user feedback
2. **Real-time Features:** Add WebSocket support for real-time AI responses
3. **File Upload:** Enhance file upload capabilities for AI tutoring
4. **Analytics:** Add usage analytics and performance monitoring
5. **Testing:** Implement comprehensive testing for the integration
6. **Deployment:** Set up production deployment configurations

## Support

For issues or questions about the integration:
1. Check the troubleshooting section above
2. Review the Python backend logs
3. Inspect browser console for frontend errors
4. Verify all environment variables are correctly set