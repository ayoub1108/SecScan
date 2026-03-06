
import fetch from 'cross-fetch';
import { ScanRequest } from '@/types/scanner';

// Use the actual edge function URL
const EDGE_FUNCTION_URL = 'https://eojucgnpskovtadfwfir.supabase.co/functions/v1/security-scanner';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvanVjZ25wc2tvdnRhZGZ3ZmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NDA3OTgsImV4cCI6MjA1MDIxNjc5OH0.n354_1M5MfeLPtiafQ4nN4QiYStK8N8cCpNw7eLW93Y';

// This is a longer running integration test that calls the actual edge function
// It's marked with 'skip' by default so it doesn't run in CI environments
// Remove the '.skip' to run it locally
describe.skip('Edge Function Integration', () => {
  // Set higher timeout for integration tests
  jest.setTimeout(30000);
  
  test('should receive a valid response from the edge function', async () => {
    const request: ScanRequest = {
      repository: 'facebook/react',
      branch: 'main',
    };
    
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify(request),
    });
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    
    // Basic structure validation
    expect(data).toHaveProperty('name');
    // Add more assertions based on the actual response structure
  });
});
