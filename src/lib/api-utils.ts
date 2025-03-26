import { NextResponse } from 'next/server';
import { ZodSchema } from 'zod';

// Define standard API response types
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = 
  | ApiSuccessResponse<T> 
  | ApiErrorResponse;

// Standard success response
export function successResponse<T = unknown>(
  data: T, 
  message = 'Success', 
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    message,
    data
  }, { status });
}

// Standard error response
export function errorResponse(
  message = 'Error', 
  status = 500, 
  details?: unknown
): NextResponse<ApiErrorResponse> {
  console.error(`API Error (${status}): ${message}`, details);
  
  return NextResponse.json({
    success: false,
    message,
    details: process.env.NODE_ENV === 'development' ? details : undefined
  }, { status });
}

// Centralized error handler for try/catch blocks
export async function withErrorHandling<T>(
  handler: () => Promise<T>,
  errorMessage = 'An error occurred'
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    const result = await handler();
    return successResponse(result);
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    
    if (error instanceof Error) {
      return errorResponse(`${errorMessage}: ${error.message}`, 500, error);
    }
    
    return errorResponse(errorMessage, 500, { error });
  }
}

// Result type for request validation
export type ValidationResult<T> = 
  | { success: true; data: T } 
  | { success: false; response: NextResponse<ApiErrorResponse> };

// Parse and validate request body using Zod schema
export async function parseAndValidateRequest<T>(
  request: Request,
  schema: ZodSchema<T>,
  errorMessage = 'Invalid request data'
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return {
        success: false,
        response: errorResponse(errorMessage, 400, result.error.format())
      };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error parsing request:', error);
    return {
      success: false,
      response: errorResponse('Failed to parse request body', 400, error)
    };
  }
}

// Create API route handler with standard error handling
export function createApiHandler<ReqT = unknown, ResT = unknown>(
  handler: (req?: Request) => Promise<ResT>,
  errorMessage: string
) {
  return async (req?: Request): Promise<NextResponse<ApiResponse<ResT>>> => {
    return withErrorHandling<ResT>(
      async () => await handler(req),
      errorMessage
    );
  };
}

// Get all items with standard error handling
export async function getAll<T>(
  fetcher: () => Promise<T[]>,
  entityName: string
): Promise<NextResponse<ApiResponse<T[]>>> {
  return withErrorHandling<T[]>(
    fetcher,
    `Failed to fetch ${entityName}`
  );
} 