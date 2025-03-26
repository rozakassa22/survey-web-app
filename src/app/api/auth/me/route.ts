import { successResponse, errorResponse, ApiResponse } from '@/lib/api-utils';
import { getCurrentUser, CurrentUser } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse<ApiResponse<CurrentUser | null>>> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return errorResponse('Not authenticated', 401);
    }
    
    return successResponse<CurrentUser>(user);
  } catch (error) {
    console.error('Auth error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown authentication error';
    
    return errorResponse(errorMessage, 500, error);
  }
} 