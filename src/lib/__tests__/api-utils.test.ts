import { 
  successResponse, 
  errorResponse,
  withErrorHandling
} from '../api-utils';

// Set environment to test
process.env.NODE_ENV = 'test';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => {
      return { data, options };
    }),
  }
}));

// Silence console errors during tests
console.error = jest.fn();

describe('API Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successResponse', () => {
    it('should create a success response with default status', () => {
      const data = { id: '123', name: 'Test' };
      const result = successResponse(data);
      
      expect(result.data).toEqual({
        success: true,
        message: 'Success',
        data
      });
      expect(result.options).toEqual({ status: 200 });
    });

    it('should create a success response with custom message and status', () => {
      const data = { id: '123', name: 'Test' };
      const result = successResponse(data, 'Created successfully', 201);
      
      expect(result.data).toEqual({
        success: true,
        message: 'Created successfully',
        data
      });
      expect(result.options).toEqual({ status: 201 });
    });
  });

  describe('errorResponse', () => {
    it('should create an error response with default status', () => {
      const result = errorResponse('Something went wrong');
      
      expect(result.data).toEqual({
        success: false,
        message: 'Something went wrong',
        details: undefined
      });
      expect(result.options).toEqual({ status: 500 });
    });

    it('should create an error response with custom status and details in development', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const details = { error: 'Details about the error' };
      const result = errorResponse('Bad request', 400, details);
      
      expect(result.data).toEqual({
        success: false,
        message: 'Bad request',
        details
      });
      expect(result.options).toEqual({ status: 400 });
      
      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('withErrorHandling', () => {
    it('should return success response when handler succeeds', async () => {
      const handler = jest.fn().mockResolvedValue({ id: '123' });
      const result = await withErrorHandling(handler, 'Error message');
      
      expect(handler).toHaveBeenCalled();
      expect(result.data).toEqual({
        success: true,
        message: 'Success',
        data: { id: '123' }
      });
    });

    it('should return error response when handler throws error', async () => {
      const error = new Error('Handler error');
      const handler = jest.fn().mockRejectedValue(error);
      
      const result = await withErrorHandling(handler, 'Custom error message');
      
      expect(handler).toHaveBeenCalled();
      expect(result.data.success).toBe(false);
      expect(result.data.message).toContain('Custom error message');
      expect(result.data.message).toContain('Handler error');
    });
  });
}); 