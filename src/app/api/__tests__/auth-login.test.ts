import { POST } from '../auth/login/route';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePasswords, setAuthCookies } from '@/lib/auth-utils';

// Define Request and Response for Node environment
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(url, options = {}) {
      this.url = url;
      this.method = options.method || 'GET';
      this.body = options.body;
      this.headers = new Headers(options.headers || {});
    }

    json() {
      return Promise.resolve(
        typeof this.body === 'string' ? JSON.parse(this.body) : this.body
      );
    }
  };
}

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth-utils', () => ({
  comparePasswords: jest.fn(),
  setAuthCookies: jest.fn().mockImplementation((response) => response),
}));

jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      ...originalModule.NextResponse,
      json: jest.fn().mockImplementation((data, options) => ({
        data,
        options,
        cookies: {
          set: jest.fn(),
          delete: jest.fn(),
        },
      })),
    },
  };
});

describe('Login API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error response for invalid email', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'password123',
      }),
    });

    // Mock user not found
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await POST(request);
    const responseData = response.data;

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'nonexistent@example.com' },
    });
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Invalid email or password');
    expect(response.options.status).toBe(401);
  });

  it('should return error response for invalid password', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrong-password',
      }),
    });

    // Mock user found but password doesn't match
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashed-password',
      role: 'USER',
    });
    (comparePasswords as jest.Mock).mockResolvedValue(false);

    const response = await POST(request);
    const responseData = response.data;

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    expect(comparePasswords).toHaveBeenCalledWith('wrong-password', 'hashed-password');
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Invalid email or password');
    expect(response.options.status).toBe(401);
  });

  it('should return success response and set cookies for valid credentials', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'correct-password',
      }),
    });

    // Mock user found with matching password
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashed-password',
      role: 'USER',
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (comparePasswords as jest.Mock).mockResolvedValue(true);

    const response = await POST(request);
    const responseData = response.data;

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    expect(comparePasswords).toHaveBeenCalledWith('correct-password', 'hashed-password');
    
    expect(responseData.success).toBe(true);
    expect(responseData.message).toBe('Login successful');
    expect(responseData.data).toEqual({ role: 'USER' });
    expect(response.options.status).toBe(200);

    expect(setAuthCookies).toHaveBeenCalledWith(
      expect.anything(),
      'user-123',
      'test@example.com',
      'USER'
    );
  });

  it('should return error for invalid request data', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        // Missing password
        email: 'test@example.com',
      }),
    });

    const response = await POST(request);
    const responseData = response.data;

    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Invalid login data');
  });

  it('should handle unexpected errors', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    // Mock a database error
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    const response = await POST(request);
    const responseData = response.data;

    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Database error');
    expect(response.options.status).toBe(500);
  });
}); 