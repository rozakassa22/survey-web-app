import { 
  setAuthCookies, 
  verifyToken,
  hashPassword,
  comparePasswords
} from '../auth-utils';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

// Mock prisma module
jest.mock('../prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock dependencies
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation(() => ({
      cookies: {
        set: jest.fn(),
        delete: jest.fn(),
      },
    })),
  },
}));

describe('Auth Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setAuthCookies', () => {
    it('should set auth cookies correctly', () => {
      const mockResponse = {
        cookies: {
          set: jest.fn(),
        },
      };

      const result = setAuthCookies(
        mockResponse as any,
        'user-123',
        'test@example.com',
        'USER'
      );

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: 'user-123',
          email: 'test@example.com',
          role: 'USER',
        },
        expect.any(String),
        { expiresIn: '1d' }
      );

      expect(mockResponse.cookies.set).toHaveBeenCalledTimes(2);
      expect(mockResponse.cookies.set).toHaveBeenCalledWith(
        'token',
        'mock-token',
        expect.objectContaining({
          httpOnly: true,
          maxAge: 60 * 60 * 24,
        })
      );

      expect(mockResponse.cookies.set).toHaveBeenCalledWith(
        'userRole',
        'USER',
        expect.objectContaining({
          httpOnly: true,
          maxAge: 60 * 60 * 24,
        })
      );

      expect(result).toBe(mockResponse);
    });
  });

  describe('verifyToken', () => {
    it('should return decoded token when valid', () => {
      const mockPayload = { userId: 'user-123', email: 'test@example.com' };
      (jwt.verify as jest.Mock).mockReturnValueOnce(mockPayload);

      const result = verifyToken('valid-token');

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
      expect(result).toEqual(mockPayload);
    });

    it('should return null when token is invalid', () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const result = verifyToken('invalid-token');

      expect(jwt.verify).toHaveBeenCalledWith('invalid-token', expect.any(String));
      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'plain-password';
      const hashedPassword = await hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(hashedPassword).toBe('hashed-password');
    });
  });

  describe('comparePasswords', () => {
    it('should return true when passwords match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await comparePasswords('plain-password', 'hashed-password');

      expect(bcrypt.compare).toHaveBeenCalledWith('plain-password', 'hashed-password');
      expect(result).toBe(true);
    });

    it('should return false when passwords do not match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await comparePasswords('wrong-password', 'hashed-password');

      expect(bcrypt.compare).toHaveBeenCalledWith('wrong-password', 'hashed-password');
      expect(result).toBe(false);
    });
  });
}); 