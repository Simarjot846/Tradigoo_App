/**
 * Jest Setup
 * Runs before each test file
 */

import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
process.env.PATHWAY_API_URL = 'http://localhost:8081';

// Mock fetch globally
global.fetch = jest.fn();

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
