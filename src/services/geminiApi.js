import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.model = null;
    
    if (this.apiKey) {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
  }

  async generateCurriculum(prompt, context = {}) {
    if (!this.model) {
      throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in .env');
    }

    const curriculumContext = context.curriculum || '';
    const pedagogyContext = context.pedagogy || '';

    const fullPrompt = `You are an expert curriculum designer creating a personalized learning course.

CONTEXT FILES:
${curriculumContext ? `\nCurriculum Map:\n${curriculumContext}\n` : ''}
${pedagogyContext ? `\nPedagogy Guidelines:\n${pedagogyContext}\n` : ''}

INSTRUCTOR REQUEST:
${prompt}

Please generate a complete, structured curriculum with the following format:

1. COURSE OVERVIEW
   - Title
   - Learning Objectives
   - Target Audience
   - Duration

2. MODULES (4-6 modules, logical progression)
   For each module:
   - Module Title
   - Duration
   - Learning Outcomes (tagged with Bloom's Taxonomy levels)
   - Prerequisites
   
3. LESSONS (for each module)
   - Lesson Title
   - Duration (≤10 min chunks)
   - Content:
     * Simplified explanations
     * Real-world examples
     * Analogies
   - Micro-video script outline
   - Interactive exercises
   - Diagrams/visuals needed

4. ASSESSMENTS
   - Checkpoints (quizzes, reflection prompts)
   - Project rubrics
   - Auto-graded exercises
   - Peer review prompts

5. RESOURCES
   - Reading lists
   - Tools/resources
   - Optional challenges for deeper learning

Format the output in Markdown with clear headers and structure.`;

    try {
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to generate curriculum: ${error.message}`);
    }
  }

  async generatePersonalizedContent(studentProfile, lessonContent) {
    if (!this.model) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `Generate personalized pre-read and post-read notes for a student.

STUDENT PROFILE:
- Name: ${studentProfile.name}
- Interests: ${studentProfile.interests || 'Not specified'}
- Learning Style: ${studentProfile.learningStyle || 'Not specified'}
- Previous Quiz Scores: ${studentProfile.scores || 'N/A'}
- Experience Level: ${studentProfile.level || 'beginner'}

LESSON CONTENT:
${lessonContent}

Create:
1. PRE-READ NOTES:
   - Brief overview tailored to their interests
   - Key concepts explained with analogies connected to their interests
   - Prerequisites check

2. POST-READ NOTES:
   - Summary with personalized connections
   - Additional examples related to their interests
   - Reflection prompts
   - Next steps

Format in Markdown.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to generate personalized content: ${error.message}`);
    }
  }

  async checkContentFreshness(content, sources = []) {
    if (!this.model) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `Analyze the following educational content and check if it needs updates based on recent developments in the field.

CONTENT TO REVIEW:
${content.substring(0, 3000)}

RECENT SOURCES:
${sources.join('\n')}

Provide:
1. Outdated sections flagged
2. Suggested updates
3. New developments to incorporate
4. Priority level (High/Medium/Low)

Format in Markdown.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to check content freshness: ${error.message}`);
    }
  }

  async generateAssessment(lessonContent, assessmentType) {
    if (!this.model) {
      throw new Error('Gemini API key not configured');
    }

    const prompt = `Generate ${assessmentType} for the following lesson content.

LESSON CONTENT:
${lessonContent}

Generate appropriate ${assessmentType} with:
- Clear rubrics (if project-based)
- Automated test cases (if code-based)
- Peer review guidelines (if peer review)
- Scoring criteria

Format in Markdown.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to generate assessment: ${error.message}`);
    }
  }
}

export default new GeminiService();

