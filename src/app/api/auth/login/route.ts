import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseAndValidateRequest, ApiResponse, ApiSuccessResponse, ApiErrorResponse } from '@/lib/api-utils';
import { loginSchema, LoginData } from '@/lib/validation';
import { comparePasswords, setAuthCookies } from '@/lib/auth-utils';
import { Role } from '@prisma/client';

// Define the login response data type
interface LoginResponseData {
  role: Role;
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<LoginResponseData>>> {
  const validation = await parseAndValidateRequest<LoginData>(
    request, 
    loginSchema, 
    'Invalid login data'
  );
  
  if (!validation.success) {
    return validation.response;
  }
  
  try {
    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Use generic error message for security
      return NextResponse.json<ApiErrorResponse>(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePasswords(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const response = NextResponse.json<ApiSuccessResponse<LoginResponseData>>(
      { 
        success: true,
        message: 'Login successful',
        data: { role: user.role }
      },
      { status: 200 }
    );

    return setAuthCookies<ApiSuccessResponse<LoginResponseData>>(response, user.id, user.email, user.role);
  } catch (error) {
    console.error('Login error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred during login';
      
    return NextResponse.json<ApiErrorResponse>(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
} 