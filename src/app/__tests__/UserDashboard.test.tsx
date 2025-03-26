import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserDashboard from '../user/page';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock SupplementaryContent component
jest.mock('@/components/ContentDisplay', () => ({
  __esModule: true,
  default: () => <div data-testid="supplementary-content">Mocked Content</div>,
}));

describe('UserDashboard', () => {
  let mockRouter: { push: jest.Mock };
  let mockFetch: jest.Mock;

  beforeEach(() => {
    // Setup router mock
    mockRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Setup fetch mock
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    // Reset toast mocks
    jest.clearAllMocks();
  });

  it('renders the UserDashboard correctly', () => {
    render(<UserDashboard />);
    
    // Check for main elements
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByText('Survey Title')).toBeInTheDocument();
    expect(screen.getByText('Generate Questions')).toBeInTheDocument();
    expect(screen.getByTestId('supplementary-content')).toBeInTheDocument();
  });

  it('handles logout correctly', async () => {
    // Mock a successful logout response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true }),
    });

    render(<UserDashboard />);
    
    // Click logout button
    fireEvent.click(screen.getByText('Logout'));
    
    // Wait for the logout to complete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
      });
      expect(toast.success).toHaveBeenCalledWith('Logged out successfully');
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  it('handles survey generation correctly', async () => {
    // Mock successful API responses
    // First for question generation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: {
          questions: [
            'What is your favorite color?',
            'How often do you exercise?',
          ],
        },
      }),
    });
    
    // Then for survey creation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: {
          id: 'survey-123',
          title: 'Test Survey',
          questions: [
            { id: 'q1', text: 'What is your favorite color?' },
            { id: 'q2', text: 'How often do you exercise?' },
          ],
        },
      }),
    });

    render(<UserDashboard />);
    
    // Fill in survey title
    fireEvent.change(screen.getByPlaceholderText('Enter your survey title'), {
      target: { value: 'Test Survey' },
    });
    
    // Submit the form to generate questions
    fireEvent.submit(screen.getByText('Generate Questions').closest('form')!);
    
    // Wait for the questions to be displayed
    await waitFor(() => {
      expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
      expect(screen.getByText('How often do you exercise?')).toBeInTheDocument();
      expect(screen.getByText('Submit Answers')).toBeInTheDocument();
    });
    
    // Check API calls
    expect(mockFetch).toHaveBeenCalledWith('/api/generate-questions', expect.anything());
    expect(mockFetch).toHaveBeenCalledWith('/api/surveys', expect.anything());
    expect(toast.success).toHaveBeenCalledWith('Questions generated successfully!');
  });

  it('handles answer submission correctly', async () => {
    // Setup fetch mocks for the entire test flow
    // 1. Generate questions API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: {
          questions: ['Question 1?', 'Question 2?'],
        },
      }),
    });
    
    // 2. Create survey API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
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
    });
    
    // 3. Submit answers API
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: [
          { id: 'r1', questionId: 'q1', text: 'Answer 1' },
          { id: 'r2', questionId: 'q2', text: 'Answer 2' },
        ],
      }),
    });

    render(<UserDashboard />);
    
    // Fill in survey title and submit
    fireEvent.change(screen.getByPlaceholderText('Enter your survey title'), {
      target: { value: 'Test Survey' },
    });
    fireEvent.submit(screen.getByText('Generate Questions').closest('form')!);
    
    // Wait for questions to appear
    await waitFor(() => {
      expect(screen.getAllByPlaceholderText('Enter your answer').length).toBe(2);
    });
    
    // Fill in answers
    const answerInputs = screen.getAllByPlaceholderText('Enter your answer');
    fireEvent.change(answerInputs[0], { target: { value: 'Answer 1' } });
    fireEvent.change(answerInputs[1], { target: { value: 'Answer 2' } });
    
    // Submit answers
    fireEvent.click(screen.getByText('Submit Answers'));
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3); // 3 API calls in total
      expect(mockFetch).toHaveBeenLastCalledWith('/api/responses', expect.anything());
      expect(toast.success).toHaveBeenLastCalledWith('Answers submitted successfully!');
    });
    
    // After submission, the questions should be cleared
    expect(screen.queryByText('Question 1?')).not.toBeInTheDocument();
  });

  it('handles error in question generation', async () => {
    // Mock an error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({
        success: false,
        message: 'Failed to generate questions',
      }),
    });

    render(<UserDashboard />);
    
    // Fill in survey title
    fireEvent.change(screen.getByPlaceholderText('Enter your survey title'), {
      target: { value: 'Test Survey' },
    });
    
    // Submit the form
    fireEvent.submit(screen.getByText('Generate Questions').closest('form')!);
    
    // Wait for error message
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to generate questions');
    });
  });
}); 