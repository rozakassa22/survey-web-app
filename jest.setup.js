// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

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

// Setup global fetch mock
global.fetch = jest.fn();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies() {
    return {
      get: jest.fn().mockImplementation((name) => {
        if (name === 'token') return { value: 'mock-token' };
        if (name === 'userRole') return { value: 'USER' };
        return null;
      }),
      set: jest.fn(),
      delete: jest.fn(),
    };
  },
  headers() {
    return new Headers();
  },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    custom: jest.fn(),
  },
  Toaster: () => null,
})); 