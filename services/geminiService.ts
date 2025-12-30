import { GoogleGenAI, Type } from "@google/genai";

// Helper to get AI instance (re-instantiate to handle key changes if needed)
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Generate an image using standard generation or editing if an input image is provided.
 * Note: Pure background removal is complex; we use editing prompts to simulate it or change background.
 */
export const generateAiImage = async (
  prompt: string,
  inputImageBase64?: string,
  ratio: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" = "1:1"
): Promise<string> => {
  const ai = getAiClient();
  const model = "gemini-2.5-flash-image";

  let contents: any = {};

  if (inputImageBase64) {
    // Image Editing / Transformation
    contents = {
      parts: [
        {
          inlineData: {
            mimeType: "image/png",
            data: inputImageBase64,
          },
        },
        { text: prompt },
      ],
    };
  } else {
    // Text to Image
    contents = {
      parts: [{ text: prompt }],
    };
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        imageConfig: {
          aspectRatio: ratio,
          // count: 1 - implicit
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from API");
  } catch (error) {
    console.error("AI Image Gen Error:", error);
    throw error;
  }
};

/**
 * Generate Video using Veo
 */
export const generateAiVideo = async (
  prompt: string,
  inputImageBase64?: string
): Promise<string> => {
  const ai = getAiClient();
  // Using fast preview for responsiveness
  const model = "veo-3.1-fast-generate-preview"; 

  // Check for paid key access (client-side check usually, but we implement the logic here)
  // The actual check is done in the component via window.aistudio
  
  try {
    let operation;
    
    if (inputImageBase64) {
      // Image to Video
       operation = await ai.models.generateVideos({
        model,
        prompt: prompt || "Animate this image cinematically",
        image: {
            imageBytes: inputImageBase64,
            mimeType: 'image/png'
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
        }
      });
    } else {
      // Text to Video
      operation = await ai.models.generateVideos({
        model,
        prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9',
        },
      });
    }

    // Polling loop
    while (!operation.done) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed to return a URI");

    // We need to fetch the actual binary because the URI requires the key
    const videoRes = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const blob = await videoRes.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("AI Video Gen Error:", error);
    throw error;
  }
};

/**
 * Helper to remove background (Simulated via Edit)
 * Gemini 2.5 Flash Image is capable of instruction following.
 */
export const removeBackgroundAi = async (imageBase64: string): Promise<string> => {
    // We ask Gemini to put it on a pure white background or green screen to make it easier
    // Since true transparency isn't fully guaranteed in output format, we try "pure white background".
    return generateAiImage("Isolate the main subject on a pure white background. High contrast.", imageBase64);
}
