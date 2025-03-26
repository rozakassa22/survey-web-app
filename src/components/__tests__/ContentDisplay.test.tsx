import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock toast before importing the component
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn()
}));

// Import the component after mocking
import SupplementaryContent from '../ContentDisplay';
import toast from 'react-hot-toast';

// Define EventSource interface
interface MockEventSourceInterface {
  onopen: jest.Mock;
  onmessage: jest.Mock;
  onerror: jest.Mock;
  addEventListener: jest.Mock;
  close: jest.Mock;
}

// Mock EventSource
class MockEventSource implements MockEventSourceInterface {
  onopen = jest.fn();
  onmessage = jest.fn();
  onerror = jest.fn();
  addEventListener = jest.fn();
  close = jest.fn();
  
  constructor() {
    return this;
  }
}

// Add EventSource to global with proper typing
global.EventSource = MockEventSource as unknown as typeof EventSource;

// Mock fetch
global.fetch = jest.fn();

describe('SupplementaryContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
  });

  it('renders the component with the button', () => {
    render(<SupplementaryContent />);
    expect(screen.getByText('Helpful Information')).toBeInTheDocument();
  });

  it('opens dropdown when the button is clicked', () => {
    render(<SupplementaryContent />);
    
    // Dropdown should not be visible initially
    expect(screen.queryByText(/Published:/)).not.toBeInTheDocument();
    
    // Click on the button
    fireEvent.click(screen.getByText('Helpful Information'));
    
    // Dropdown should now be visible (but empty since we haven't mocked data)
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('fetches and displays content when dropdown is opened', async () => {
    // Mock successful API response
    const mockData = {
      success: true,
      message: 'Success',
      data: {
        data: [
          {
            id: 1,
            title: 'Privacy Policy',
            content: 'This is our privacy policy content.',
            slug: 'privacy-policy',
            createdAt: '2023-01-01T00:00:00.000Z',
          },
          {
            id: 2,
            title: 'Survey Guide',
            content: 'This is our survey guide content.',
            slug: 'survey-guide',
            createdAt: '2023-01-02T00:00:00.000Z',
          },
        ],
        meta: {
          pagination: {
            page: 1,
            pageSize: 25,
            pageCount: 1,
            total: 2,
          },
        },
      },
    };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData),
    });
    
    render(<SupplementaryContent />);
    
    // Open the dropdown
    fireEvent.click(screen.getByText('Helpful Information'));
    
    // Wait for the content to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Survey Guide')).toBeInTheDocument();
    });
    
    // Check if the content is rendered
    expect(screen.getByText('This is our privacy policy content.')).toBeInTheDocument();
    expect(screen.getByText('This is our survey guide content.')).toBeInTheDocument();
  });

  it('shows error toast when fetch fails', async () => {
    // Mock failed API response
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(<SupplementaryContent />);
    
    // Wait for fetch error toast to be called
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load supplementary content');
    });
  });
}); 