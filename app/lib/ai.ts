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
  private geminiApiKey: string | undefined

  private constructor() {
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async chat(prompt: string, config?: AIConfig): Promise<AIResponse> {
    if (!this.geminiApiKey) {
      throw new Error('Google Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.')
    }

    return await this.chatWithGemini(prompt, config?.model || 'gemini-2.5-flash', config?.temperature || 0.7, config?.maxTokens || 1000)
  }

  private async chatWithGemini(prompt: string, model: string, temperature: number, maxTokens: number): Promise<AIResponse> {
    if (!this.geminiApiKey) throw new Error('Gemini API key not configured')

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: temperature,
            maxOutputTokens: maxTokens,
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini')
      }

      const content = data.candidates[0].content.parts[0].text

      return {
        message: {
          content,
          role: 'assistant'
        },
        usage: {
          model,
          provider: 'gemini',
          cost: 0,
          tokens: data.usageMetadata?.totalTokenCount || 0
        }
      }
    } catch (error) {
      console.error('Gemini chat error:', error)
      throw error
    }
  }

  async img2txt(imageFile: File, prompt: string = "Extract all text from this image. Format the output as clean, readable text preserving the original structure and formatting as much as possible."): Promise<string> {
    if (!this.geminiApiKey) {
      throw new Error('Google Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.')
    }

    try {
      console.log('🔍 Starting PDF text extraction with Gemini Vision API...')
      console.log('📄 Image file type:', imageFile.type)
      console.log('📄 Image file size:', imageFile.size)
      console.log('🎯 Using prompt:', prompt)

      // Convert File to base64
      const imageBase64 = await this.fileToBase64(imageFile)
      console.log('📄 Base64 conversion complete, length:', imageBase64.length)

      // Clean base64 data - remove data URL prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[^;]+;base64,/, '')
      console.log('🧹 Cleaned base64 data length:', cleanBase64.length)

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: cleanBase64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4000,
          }
        })
      })

      console.log('📡 API Response status:', response.status)
      console.log('📡 API Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Response:', errorText)
        throw new Error(`Gemini Vision API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('📄 Full API Response:', JSON.stringify(data, null, 2))

      if (!data.candidates || data.candidates.length === 0) {
        console.error('❌ No candidates in response')
        throw new Error('No response generated from Gemini Vision API')
      }

      const candidate = data.candidates[0]
      console.log('🎯 First candidate:', JSON.stringify(candidate, null, 2))

      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        console.error('❌ No content parts in candidate')
        throw new Error('Invalid response structure from Gemini Vision API')
      }

      const extractedText = candidate.content.parts[0].text
      console.log('✅ Successfully extracted text length:', extractedText.length)
      console.log('📝 Extracted text preview:', extractedText.substring(0, 200) + '...')

      return extractedText
    } catch (error) {
      console.error('❌ Error in img2txt:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      throw error
    }
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
    const analysisPrompt = `Please analyze this resume for the position of "${jobTitle}" with the following job description:

Job Description:
${jobDescription}

Please provide a comprehensive evaluation structured as JSON with the following format:

{
  "overall_score": <number between 0-100>,
  "summary": "<brief overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", ...],
  "ats_score": <number between 0-100>,
  "ats_feedback": "<specific ATS optimization feedback>",
  "sections": {
    "contact": {"score": <0-100>, "feedback": "<feedback>"},
    "summary": {"score": <0-100>, "feedback": "<feedback>"},
    "experience": {"score": <0-100>, "feedback": "<feedback>"},
    "education": {"score": <0-100>, "feedback": "<feedback>"},
    "skills": {"score": <0-100>, "feedback": "<feedback>"}
  }
}

Resume text to analyze:
${resumeText}`

    return await this.chat(analysisPrompt)
  }

  getAvailableProviders(): AIProvider[] {
    return this.geminiApiKey ? ['gemini'] : []
  }

  getProviderStatus(): Record<AIProvider, boolean> {
    return {
      gemini: !!this.geminiApiKey
    }
  }
}

// Export singleton instance
export const aiService = AIService.getInstance()
