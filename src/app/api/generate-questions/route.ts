import { NextResponse } from "next/server";
import Together from "together-ai";
import { parseAndValidateRequest, ApiResponse, errorResponse, successResponse } from "@/lib/api-utils";
import { generateQuestionsSchema, GenerateQuestionsData } from "@/lib/validation";

// Type definition for AI model response
interface GenerateQuestionsResponse {
  questions: string[];
}

if (!process.env.TOGETHER_API_KEY) {
  throw new Error("TOGETHER_API_KEY is not set in environment variables");
}

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY!,
});

export async function POST(req: Request): Promise<NextResponse<ApiResponse<GenerateQuestionsResponse>>> {
  const validation = await parseAndValidateRequest<GenerateQuestionsData>(
    req, 
    generateQuestionsSchema, 
    'Invalid title'
  );
  
  if (!validation.success) {
    return validation.response;
  }
  
  try {
    const { title } = validation.data;

    const prompt = `Generate 5 engaging and unique questions for a survey based on the topic: ${title}. 
    Format the response as a JSON array of strings, each string being a question. 
    Make the questions diverse and thought-provoking.`;

    const response = await together.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from AI model");
    }
    
    try {
      const questions = JSON.parse(content) as string[];
      return successResponse<GenerateQuestionsResponse>({ questions }, "Questions generated successfully");
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      throw new Error("Failed to parse AI response as JSON");
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    
    const message = error instanceof Error 
      ? error.message 
      : "Failed to generate questions";
      
    return errorResponse(message, 500, error);
  }
} 