import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { prompt, config } = await request.json();
    
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured on server');
    }

    const model = config?.model || 'gemini-2.5-flash';
    const temperature = config?.temperature || 0.7;
    const maxTokens = config?.maxTokens || 1000;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: maxTokens,
          topP: 1,
          topK: 1
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', response.status, errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    const content = data.candidates[0].content.parts[0].text;
    const usage = data.usageMetadata;

    return Response.json({
      message: {
        content: content,
        role: 'assistant'
      },
      usage: {
        model: model,
        provider: 'gemini' as const,
        cost: 0, // Would need to calculate based on token usage and pricing
        tokens: usage?.totalTokenCount || 0
      }
    });

  } catch (error) {
    console.error('AI API error:', error);
    return Response.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
