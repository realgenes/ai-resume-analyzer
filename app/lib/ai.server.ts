// AI Service for Google Gemini
export type AIProvider = 'gemini'

export interface AIResponse {
  message: {
    content: string
    role: string
  }
  usage?: {
    model: string
    provider: AIProvider
    cost: number
    tokens?: number
  }
}

export interface AIConfig {
  provider?: AIProvider
  model?: string
  temperature?: number
  maxTokens?: number
}

export class AIService {
  private static instance: AIService

  private constructor() {
    // No longer storing API key on client-side for security
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async chat(prompt: string, config?: AIConfig): Promise<AIResponse> {
    // Use server-side API route instead of direct API calls
    return await this.chatViaServerAPI(prompt, config)
  }

  private async chatViaServerAPI(prompt: string, config?: AIConfig): Promise<AIResponse> {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          config: {
            model: config?.model || 'gemini-2.5-flash',
            temperature: config?.temperature || 0.7,
            maxTokens: config?.maxTokens || 1000
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`AI API error: ${response.status} - ${errorData}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling AI API:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  async img2txt(imageFile: File, prompt: string = "Extract all text from this image. Format the output as clean, readable text preserving the original structure and formatting as much as possible."): Promise<string> {
    // For now, this feature would need to be moved to server-side as well
    // or use a different approach that doesn't expose API keys
    throw new Error('Image to text functionality temporarily disabled for security. Please use PDF text extraction instead.');
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('FileReader result is not a string'))
        }
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  async analyzeResume(resumeText: string, jobDescription: string, jobTitle: string): Promise<AIResponse> {
    // Add timestamp to ensure unique analysis each time
    const timestamp = Date.now();
    const analysisId = Math.random().toString(36).substr(2, 9);
    
    const analysisPrompt = `ANALYSIS ID: ${analysisId} | TIMESTAMP: ${timestamp}

You are an expert resume analyzer. Your task is to provide a UNIQUE, DETAILED analysis for this specific resume and job combination.

CRITICAL: Do NOT copy any example scores or template values. Analyze the actual resume content and job description provided below.

JOB TITLE: ${jobTitle}
JOB DESCRIPTION: ${jobDescription}

RESUME CONTENT TO ANALYZE:
${resumeText}

INSTRUCTIONS:
1. Read the resume content carefully
2. Compare it against the job requirements
3. Calculate scores based on ACTUAL content quality and job fit
4. Provide specific, actionable feedback
5. Extract real keywords from both resume and job description

REQUIRED OUTPUT FORMAT (JSON only, no markdown):
{
  "overall_score": [CALCULATED SCORE 0-100],
  "ats_score": [CALCULATED SCORE 0-100],
  "summary": "[SPECIFIC assessment based on this resume]",
  "strengths": ["[ACTUAL strength from resume content]"],
  "weaknesses": ["[ACTUAL weakness from resume content]"],
  "suggestions": ["[ACTIONABLE suggestion for this resume]"],
  "ATS": {
    "score": [CALCULATED SCORE 0-100],
    "tips": ["[SPECIFIC ATS tip for this resume]"]
  },
  "keywords_found": ["[KEYWORDS ACTUALLY IN RESUME]"],
  "keywords_missing": ["[KEYWORDS FROM JOB DESC MISSING IN RESUME]"],
  "sections": {
    "contact": {"score": [SCORE], "feedback": "[SPECIFIC feedback]"},
    "summary": {"score": [SCORE], "feedback": "[SPECIFIC feedback]"},
    "experience": {"score": [SCORE], "feedback": "[SPECIFIC feedback]"},
    "education": {"score": [SCORE], "feedback": "[SPECIFIC feedback]"},
    "skills": {"score": [SCORE], "feedback": "[SPECIFIC feedback]"}
  }
}

SCORING RULES:
- overall_score: Based on job fit + resume quality (0-100)
- ats_score: Based on keyword matching + formatting (0-100)
- Higher scores for resumes that closely match job requirements
- Lower scores for generic or poorly matched resumes
- Be objective and specific in your analysis`

    return await this.chat(analysisPrompt, { temperature: 0.3, maxTokens: 4000 })
  }

  getAvailableProviders(): AIProvider[] {
    return ['gemini'] // Always available since we use server-side API
  }

  getProviderStatus(): Record<AIProvider, boolean> {
    return {
      gemini: true // Always true since server handles the API key
    }
  }
}

// Export singleton instance
export const aiService = AIService.getInstance()
