import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';

// Create mock toast functions
const mockSuccess = jest.fn();
const mockError = jest.fn();

// Mock toast before importing any component that uses it
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: jest.fn(),
  toast: {
    success: jest.fn().mockImplementation((...args) => mockSuccess(...args)),
    error: jest.fn().mockImplementation((...args) => mockError(...args))
  },
  success: jest.fn().mockImplementation((...args) => mockSuccess(...args)),
  error: jest.fn().mockImplementation((...args) => mockError(...args))
}));

// Import the component that uses toast
import UserDashboard from '../user/page';

// Mock the next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock the form handling
jest.mock('react-hook-form', () => ({
  useForm: () => {
    const onSubmitHandler = jest.fn();
    
    return {
      register: jest.fn().mockImplementation((name: string) => ({
        name,
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn()
      })),
      handleSubmit: (fn: (data: {title: string}) => Promise<void>) => {
        onSubmitHandler.mockImplementation((e?: { preventDefault?: () => void }) => {
          e?.preventDefault?.();
          return fn({ title: 'Test Survey' });
        });
        return onSubmitHandler;
      },
      formState: { 
        isSubmitting: false,
        errors: {
          title: undefined // Ensure title property exists but is undefined to prevent errors
        }
      },
      reset: jest.fn(),
    };
  },
  zodResolver: jest.fn(() => jest.fn())
}));

// Mock the SupplementaryContent component
jest.mock('../../components/ContentDisplay', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="supplementary-content">Mocked Content</div>,
  };
});

describe('UserDashboard', () => {
  // Mock fetch
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  // Mock router
  const mockRouter = { push: jest.fn() };
  (useRouter as jest.Mock).mockReturnValue(mockRouter);

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup fetch mocks for the tests
    mockFetch.mockImplementation(async (url) => {
      if (url === '/api/generate-questions') {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { questions: ['Question 1?', 'Question 2?'] },
          }),
        };
      } else if (url === '/api/surveys') {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: {
              id: 'survey-123',
              title: 'Test Survey',
              questions: [
                { id: 'q1', text: 'Question 1?' },
                { id: 'q2', text: 'Question 2?' },
              ],
            },
          }),
        };
      } else if (url === '/api/responses') {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: [
              { id: 'r1', questionId: 'q1', text: 'Answer 1' },
              { id: 'r2', questionId: 'q2', text: 'Answer 2' },
            ],
          }),
        };
      } else if (url === '/api/auth/logout') {
        return {
          ok: true,
          json: async () => ({
            success: true,
            message: 'Logged out successfully',
          }),
        };
      }

      return {
        ok: false,
        json: async () => ({
          success: false,
          message: 'Failed',
        }),
      };
    });
  });

  it('handles logout correctly', async () => {
    render(<UserDashboard />);
    
    // Find and click the logout button
    const logoutButton = screen.getByText('Logout');
    
    // Call the logout handler directly to avoid JSDOM limitations
    fireEvent.click(logoutButton);
    
    // Check if fetch was called correctly
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
      });
      expect(mockSuccess).toHaveBeenCalledWith('Logged out successfully');
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  it('handles survey generation correctly', async () => {
    render(<UserDashboard />);
    
    // Find the form and directly call its submit handler
    const form = screen.getByText('Survey Title').closest('form');
    if (form) fireEvent.submit(form);
    
    // Check if fetch was called correctly with the form data
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/generate-questions', expect.anything());
      expect(mockFetch).toHaveBeenCalledWith('/api/surveys', expect.anything());
      expect(mockSuccess).toHaveBeenCalledWith('Questions generated successfully!');
    });
  });

  it('handles answer submission correctly', async () => {
    render(<UserDashboard />);
    
    // First generate the questions by submitting the form directly
    const form = screen.getByText('Survey Title').closest('form');
    if (form) fireEvent.submit(form);
    
    // Wait for questions to appear
    await waitFor(() => {
      expect(screen.getByText('Question 1?')).toBeInTheDocument();
      expect(screen.getByText('Question 2?')).toBeInTheDocument();
    });
    
    // Fill in answers
    const textareas = screen.getAllByRole('textbox');
    expect(textareas.length).toBe(3); // Survey title + 2 answer fields
    
    fireEvent.change(textareas[1], { target: { value: 'Answer 1' } });
    fireEvent.change(textareas[2], { target: { value: 'Answer 2' } });
    
    // Get the submit answers button and call its onClick handler directly
    const submitButton = screen.getByText('Submit Answers');
    fireEvent.click(submitButton);
    
    // Check if fetch was called correctly
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/responses', expect.anything());
      expect(mockSuccess).toHaveBeenCalledWith('Answers submitted successfully!');
    });
    
    // After submission, the questions should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Question 1?')).not.toBeInTheDocument();
      expect(screen.queryByText('Question 2?')).not.toBeInTheDocument();
    });
  });

  it('handles error in question generation', async () => {
    // Mock fetch to fail for this test
    mockFetch.mockRejectedValueOnce(new Error('Failed to generate questions'));
    
    render(<UserDashboard />);
    
    // Find the form and directly call its submit handler
    const form = screen.getByText('Survey Title').closest('form');
    if (form) fireEvent.submit(form);
    
    // Wait for error message
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Failed to generate questions');
    });
  });
}); 