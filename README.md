# Dhumi EduPilot - AI Copilot for Instructors

An AI-powered platform that helps instructors create personalized, up-to-date educational content efficiently.

## Features

- **Curriculum-Aware Generation**: Generate complete lesson plans using Gemini AI with context from curriculum.md and pedagogy.md
- **Human-in-the-Loop Editing**: Review and edit AI-generated content with side-by-side diff view
- **Personalized Content Engine**: Generate tailored pre-read and post-read notes for each student
- **Assessment Tools**: Create project rubrics, auto-graded code notebooks, and peer review prompts
- **Content Freshness Scanner**: Check if content needs updates based on latest developments
- **Student Management**: Upload CSV files with student profiles and generate personalized content

## Tech Stack

- **Frontend**: React + Vite, TailwindCSS, Monaco Editor
- **AI/LLM**: Google Gemini API (free tier available)
- **Storage**: LocalStorage (can be upgraded to Firebase/Supabase)
- **Deployment**: Vercel or Netlify (free tier)

## Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Get a free Gemini API key:**
   - Visit https://ai.google.dev/
   - Create a free API key
   - Free tier: 15 requests/minute, 1500 requests/day

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Add your API key to `.env`:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## Usage

1. **Load Course**: The app automatically creates a sample course. Context files (curriculum.md, pedagogy.md) are parsed automatically.

2. **Generate Content**: 
   - Click "AI Copilot" to open the sidebar
   - Enter a prompt like "RAG module, intermediate, 5 days"
   - Review the generated content in the diff view
   - Accept, reject, or edit the content

3. **Manage Students**:
   - Go to Dashboard
   - Upload a CSV file with student profiles
   - Generate personalized notes for each student

4. **Create Assessments**:
   - Open a lesson file
   - Click "Assessment" button
   - Choose assessment type (Project Rubric, Code Notebook, Peer Review)
   - Generate and review

5. **Check Content Freshness**:
   - Open a content file
   - Click "Check Freshness"
   - Review flagged outdated sections

## CSV Format for Students

Your CSV should include these columns:
- `name` or `Name`: Student name
- `level` or `Level`: beginner/intermediate/advanced
- `interests` or `Interests`: Student interests
- `learningStyle` or `LearningStyle`: Learning style preference
- `scores` or `Scores`: Previous quiz scores

Example:
```csv
name,level,interests,learningStyle,scores
John Doe,intermediate,AI,visual,85
Jane Smith,beginner,Web Dev,auditory,72
```

## Project Structure

```
src/
├── components/          # React components
│   ├── AISidebar.jsx   # AI prompt interface
│   ├── Dashboard.jsx   # Student management & stats
│   ├── DiffView.jsx    # Content review interface
│   ├── Editor.jsx      # Monaco code editor
│   ├── FileExplorer.jsx # File tree navigation
│   └── ...
├── services/           # Business logic
│   ├── geminiApi.js    # Gemini API integration
│   └── storage.js      # LocalStorage service
└── App.jsx             # Main application
```

## Free Tier Limitations

- Gemini API: 15 requests/minute, 1500 requests/day
- LocalStorage: ~5-10MB (sufficient for demo)
- Vercel/Netlify: 100GB bandwidth/month

## Future Enhancements

- LMS integration via APIs
- MCP (Model Context Protocol) support
- Group Activity Generator
- Gamification layer
- Vector search for better context
- Real-time collaboration

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

