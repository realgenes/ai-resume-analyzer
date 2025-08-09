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
      console.log('🔵 Starting AI API call...');
      
      const apiPromise = fetch('/api/ai', {
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

      // Add 60-second timeout for AI calls
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('AI request timeout after 60 seconds')), 60000);
      });

      console.log('🔵 Waiting for AI response...');
      const response = await Promise.race([apiPromise, timeoutPromise]);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('🔴 AI API error:', response.status, errorData);
        throw new Error(`AI API error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      console.log('🟢 AI response received, length:', result.message?.content?.length || 0);
      return result;
    } catch (error) {
      console.error('🔴 Error calling AI API:', error);
      throw new Error('Failed to get AI response: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
    const analysisPrompt = `Analyze this resume for "${jobTitle}" position. Job: ${jobDescription}

Resume: ${resumeText}

Return ONLY valid JSON (no markdown, no extra text):
{
  "overall_score": 85,
  "ats_score": 82,
  "summary": "Brief assessment here",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "ATS": {
    "score": 82,
    "tips": ["tip 1", "tip 2"]
  },
  "keywords_found": ["keyword1", "keyword2"],
  "keywords_missing": ["missing1", "missing2"],
  "sections": {
    "contact": {"score": 85, "feedback": "feedback"},
    "summary": {"score": 80, "feedback": "feedback"},
    "experience": {"score": 90, "feedback": "feedback"},
    "education": {"score": 75, "feedback": "feedback"},
    "skills": {"score": 88, "feedback": "feedback"}
  }
}`

    return await this.chat(analysisPrompt, { temperature: 0.1, maxTokens: 4000 })
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
