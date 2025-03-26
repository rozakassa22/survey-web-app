import { middleware } from '../middleware';
import type { NextRequest } from 'next/server';

// Define a minimal interface for our mock
interface MockRequestProps {
  cookies: {
    get: jest.Mock;
  };
  nextUrl: {
    pathname: string;
    clone: jest.Mock;
  };
  url: string;
  [key: string]: unknown;
}

// Mock NextRequest and NextResponse
const mockRedirect = jest.fn().mockImplementation((url: URL) => ({ 
  url, 
  type: 'redirect',
  status: 302,
  headers: new Headers(),
}));

const mockNext = jest.fn().mockReturnValue({ 
  type: 'next',
  status: 200,
  headers: new Headers(),
});

// Mock NextRequest and NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: (url: URL) => mockRedirect(url),
    next: () => mockNext(),
  },
  NextRequest: jest.fn(),
}));

describe('Middleware', () => {
  let mockRequest: MockRequestProps;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mocked request for each test
    mockRequest = {
      cookies: {
        get: jest.fn(),
      },
      nextUrl: {
        pathname: '/',
        clone: jest.fn().mockReturnThis(),
      },
      url: 'http://localhost:3000',
    };
  });
  
  it('should redirect unauthenticated users to login when accessing protected routes', () => {
    // No token
    mockRequest.cookies.get.mockReturnValue(null);
    mockRequest.nextUrl.pathname = '/user';
    
    const result = middleware(mockRequest as unknown as NextRequest);
    
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/login',
      })
    );
    expect(result.type).toBe('redirect');
  });
  
  it('should allow unauthenticated users to access public routes', () => {
    // No token
    mockRequest.cookies.get.mockReturnValue(null);
    mockRequest.nextUrl.pathname = '/login';
    
    const result = middleware(mockRequest as unknown as NextRequest);
    
    expect(mockNext).toHaveBeenCalled();
    expect(result.type).toBe('next');
  });
  
  it('should redirect admin users to admin dashboard when accessing root', () => {
    // Admin token
    mockRequest.cookies.get.mockImplementation((name: string) => {
      if (name === 'token') return { value: 'mock-token' };
      if (name === 'userRole') return { value: 'ADMIN' };
      return null;
    });
    
    mockRequest.nextUrl.pathname = '/';
    
    const result = middleware(mockRequest as unknown as NextRequest);
    
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/admin',
      })
    );
    expect(result.type).toBe('redirect');
  });
  
  it('should redirect regular users to user dashboard when accessing root', () => {
    // User token
    mockRequest.cookies.get.mockImplementation((name: string) => {
      if (name === 'token') return { value: 'mock-token' };
      if (name === 'userRole') return { value: 'USER' };
      return null;
    });
    
    mockRequest.nextUrl.pathname = '/';
    
    const result = middleware(mockRequest as unknown as NextRequest);
    
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/user',
      })
    );
    expect(result.type).toBe('redirect');
  });
  
  it('should redirect admin users to admin dashboard when trying to access user page', () => {
    // Admin token
    mockRequest.cookies.get.mockImplementation((name: string) => {
      if (name === 'token') return { value: 'mock-token' };
      if (name === 'userRole') return { value: 'ADMIN' };
      return null;
    });
    
    mockRequest.nextUrl.pathname = '/user';
    
    const result = middleware(mockRequest as unknown as NextRequest);
    
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/admin',
      })
    );
    expect(result.type).toBe('redirect');
  });
  
  it('should redirect regular users to user dashboard when trying to access admin page', () => {
    // User token
    mockRequest.cookies.get.mockImplementation((name: string) => {
      if (name === 'token') return { value: 'mock-token' };
      if (name === 'userRole') return { value: 'USER' };
      return null;
    });
    
    mockRequest.nextUrl.pathname = '/admin';
    
    const result = middleware(mockRequest as unknown as NextRequest);
    
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/user',
      })
    );
    expect(result.type).toBe('redirect');
  });
  
  it('should allow authenticated users to access their appropriate dashboard', () => {
    // Admin token
    mockRequest.cookies.get.mockImplementation((name: string) => {
      if (name === 'token') return { value: 'mock-token' };
      if (name === 'userRole') return { value: 'ADMIN' };
      return null;
    });
    
    mockRequest.nextUrl.pathname = '/admin';
    
    const result = middleware(mockRequest as unknown as NextRequest);
    
    expect(mockNext).toHaveBeenCalled();
    expect(result.type).toBe('next');
  });
  
  it('should redirect authenticated users away from login page', () => {
    // User token
    mockRequest.cookies.get.mockImplementation((name: string) => {
      if (name === 'token') return { value: 'mock-token' };
      if (name === 'userRole') return { value: 'USER' };
      return null;
    });
    
    mockRequest.nextUrl.pathname = '/login';
    
    const result = middleware(mockRequest as unknown as NextRequest);
    
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/user',
      })
    );
    expect(result.type).toBe('redirect');
  });
}); 