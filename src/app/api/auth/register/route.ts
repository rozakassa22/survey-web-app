import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, parseAndValidateRequest, ApiResponse } from '@/lib/api-utils';
import { registerSchema, RegisterData } from '@/lib/validation';
import { hashPassword } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';

// Define register response data type
interface RegisterResponseData {
  email: string;
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<RegisterResponseData>>> {
  const validation = await parseAndValidateRequest<RegisterData>(
    request, 
    registerSchema, 
    'Invalid registration data'
  );
  
  if (!validation.success) {
    return validation.response;
  }
  
  try {
    const { name, email, password, gender } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse('User with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gender: gender || "",
        role: 'USER',
      },
    });

    return successResponse<RegisterResponseData>(
      { email },
      'User registered successfully',
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred during registration';
    
    return errorResponse(errorMessage, 500, error);
  }
} 