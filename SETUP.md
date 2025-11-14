# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Get Gemini API Key

1. Go to https://ai.google.dev/
2. Sign in with your Google account
3. Click "Get API Key" → "Create API Key"
4. Copy your API key

## Step 3: Configure Environment

Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual API key.

## Step 4: Run the Application

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Step 5: Test the Features

### Generate Content
1. Open "AI Copilot" (top right)
2. Type a prompt: "RAG module, intermediate, 5 days"
3. Click "Generate"
4. Review the generated content in the diff view
5. Accept or edit the content

### Add Students
1. Go to Dashboard
2. Click "Upload CSV"
3. Use `public/sample-students.csv` as an example
4. Generate personalized notes for students

### Create Assessments
1. Open any lesson file
2. Click "Assessment" button
3. Select assessment type
4. Generate and review

### Check Content Freshness
1. Open a content file
2. Click "Check Freshness"
3. Review flagged sections

## Troubleshooting

### "Gemini API key not configured"
- Make sure `.env` file exists in the root directory
- Restart the dev server after adding the API key
- Check that the variable name is exactly `VITE_GEMINI_API_KEY`

### API Rate Limits
- Free tier: 15 requests/minute, 1500 requests/day
- If you hit limits, wait a few minutes or upgrade your API plan

### Build for Production
```bash
npm run build
```

Deploy the `dist` folder to Vercel or Netlify.

