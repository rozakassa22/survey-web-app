import { NextResponse } from 'next/server';
import { successResponse, ApiSuccessResponse } from '@/lib/api-utils';

export async function POST(): Promise<NextResponse<ApiSuccessResponse<null>>> {
  try {
    const response = NextResponse.json<ApiSuccessResponse<null>>(
      { 
        success: true,
        message: 'Logged out successfully',
        data: null
      },
      { status: 200 }
    );

    // Clear all auth cookies
    response.cookies.delete('token');
    response.cookies.delete('userRole');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    // Return a successful response anyway since we're just logging out
    return successResponse<null>(null, 'Logged out successfully');
  }
} 