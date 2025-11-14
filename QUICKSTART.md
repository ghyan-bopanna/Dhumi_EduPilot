# 🚀 Quick Start - Dhumi EduPilot

Get up and running in 5 minutes!

## Prerequisites
- Node.js 16+ installed
- A Google account (for Gemini API key)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Your Free Gemini API Key
1. Visit: https://ai.google.dev/
2. Click "Get API Key" → "Create API Key"
3. Copy the API key

### 3. Create `.env` File
Create a file named `.env` in the root directory:
```env
VITE_GEMINI_API_KEY=paste_your_api_key_here
```

### 4. Start the App
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## First Steps

### 1. Generate Your First Module
- Click **"AI Copilot"** button (top right)
- Type: `"RAG module, intermediate, 5 days"`
- Click **"Generate"**
- Review the generated content in the diff view
- **Accept** or **Edit** the content

### 2. Add Students
- Click **"Dashboard"** button
- Click **"Upload CSV"**
- Use `public/sample-students.csv` as a template
- Generate personalized notes for each student

### 3. Create Assessments
- Open any lesson file
- Click **"Assessment"** button
- Choose: Project Rubric, Code Notebook, or Peer Review
- Generate and review

### 4. Check Content Freshness
- Open a content file
- Click **"Check Freshness"** button
- Review flagged outdated sections

## Tips

✅ **Context Files**: Edit `curriculum.md` and `pedagogy.md` to customize AI generation  
✅ **Free Tier**: 15 requests/minute, 1500/day (plenty for testing)  
✅ **LocalStorage**: All data is saved in your browser  
✅ **CSV Format**: Use `public/sample-students.csv` as reference  

## Need Help?

Check `README.md` for detailed documentation or `SETUP.md` for troubleshooting.

---

**Happy Teaching! 🎓**

