import { submitSurveyResponses } from "@/lib/db-utils";
import { parseAndValidateRequest, withErrorHandling, ApiResponse } from "@/lib/api-utils";
import { responseSchema, ResponseData } from "@/lib/validation";
import { NextResponse } from "next/server";
import { Response } from "@prisma/client";

export async function POST(req: Request): Promise<NextResponse<ApiResponse<Response[]>>> {
  const validation = await parseAndValidateRequest<ResponseData>(req, responseSchema, 'Invalid response data');
  
  if (!validation.success) {
    return validation.response;
  }
  
  return withErrorHandling<Response[]>(async () => {
    const { surveyId, answers } = validation.data;
    return await submitSurveyResponses(surveyId, answers);
  }, "Failed to submit responses");
} 