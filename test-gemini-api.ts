import { GoogleGenAI } from "@google/genai";

async function testGemini() {
  try {
    const ai = new GoogleGenAI({
      apiKey: "test-key"
    });

    // Test text generation
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello world"
    });

    console.log('Text response:', response.text);

    // Test with image
    const imageResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [
        {
          role: "user",
          parts: [
            { text: "What's in this image?" },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: "base64-data-here"
              }
            }
          ]
        }
      ]
    });

    console.log('Image response:', imageResponse.text);
  } catch (error) {
    console.error('Error:', error);
  }
}

export { testGemini };
