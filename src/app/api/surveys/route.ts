import { createSurvey, getAllSurveys, SurveyWithQuestionsAndResponses } from "@/lib/db-utils";
import { 
  getAll, 
  parseAndValidateRequest, 
  withErrorHandling, 
  ApiResponse 
} from "@/lib/api-utils";
import { surveySchema, SurveyData } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<NextResponse<ApiResponse<SurveyWithQuestionsAndResponses>>> {
  const validation = await parseAndValidateRequest<SurveyData>(req, surveySchema, 'Invalid survey data');
  
  if (!validation.success) {
    return validation.response;
  }
  
  return withErrorHandling<SurveyWithQuestionsAndResponses>(async () => {
    const { title, questions } = validation.data;
    return await createSurvey(title, questions);
  }, "Failed to create survey");
}

export async function GET(): Promise<NextResponse<ApiResponse<SurveyWithQuestionsAndResponses[]>>> {
  return getAll(getAllSurveys, 'surveys');
} 