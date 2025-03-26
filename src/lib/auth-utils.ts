import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { NextResponse } from 'next/server';
import { Role, User } from '@prisma/client';

// Define JWT payload type
export interface AuthJwtPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Define current user type
export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

// Define cookie options type
export interface AuthCookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
}

/**
 * Set authentication cookies for a user
 */
export function setAuthCookies<T>(
  response: NextResponse<T>,
  userId: string,
  email: string,
  role: string
): NextResponse<T> {
  const token = jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '1d' }
  );

  const cookieOptions: AuthCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 1 day
  };

  response.cookies.set('token', token, cookieOptions);
  response.cookies.set('userRole', role, cookieOptions);

  return response;
}

/**
 * Verify JWT token and return decoded payload
 */
export function verifyToken<T extends AuthJwtPayload>(token: string): T | null {
  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as T;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Get current user from cookies
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken<AuthJwtPayload>(token);
    if (!decoded?.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare password with hash
 */
export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
} 