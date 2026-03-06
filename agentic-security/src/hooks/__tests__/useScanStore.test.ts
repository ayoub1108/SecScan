
import { renderHook, act } from '@testing-library/react-hooks';
import { useScanStore } from '../useScanStore';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import 'cross-fetch/polyfill';

// Mock the localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Setup mock server with MSW v2 syntax
const server = setupServer(
  http.post('https://eojucgnpskovtadfwfir.supabase.co/functions/v1/security-scanner', () => {
    return HttpResponse.json({
      scanId: 'test-scan-123',
      timestamp: new Date().toISOString(),
      findings: [
        {
          id: 'finding-1',
          title: 'Test Finding',
          description: 'This is a test finding',
          severity: 'high',
          createdAt: new Date().toISOString(),
        }
      ],
      summary: {
        critical: 0,
        high: 1,
        medium: 0,
        low: 0,
        info: 0
      },
      status: 'completed',
    })
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  localStorageMock.clear();
});
afterAll(() => server.close());

describe('useScanStore', () => {
  test('should initialize with empty history', () => {
    const { result } = renderHook(() => useScanStore());
    expect(result.current.history).toEqual([]);
  });
  
  test('should run a scan and update history', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useScanStore());
    
    act(() => {
      result.current.runScan({ repository: 'test/repo' });
    });
    
    // Wait for the async operation to complete
    await waitForNextUpdate();
    
    expect(result.current.loading).toBe(false);
    expect(result.current.history.length).toBe(1);
    expect(result.current.history[0].repository).toBe('test/repo');
    expect(result.current.currentScan).not.toBeNull();
  });
  
  test('should clear history', () => {
    const { result } = renderHook(() => useScanStore());
    
    // Add a mock scan result to history
    act(() => {
      localStorageMock.setItem('security-scanner-history', JSON.stringify([
        {
          id: 'test-id',
          repository: 'test/repo',
          branch: 'main',
          timestamp: new Date().toISOString(),
          findings: [],
          summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
          status: 'completed'
        }
      ]));
    });
    
    // Re-render to load from localStorage
    const { result: newResult } = renderHook(() => useScanStore());
    expect(newResult.current.history.length).toBe(1);
    
    act(() => {
      newResult.current.clearHistory();
    });
    
    expect(newResult.current.history).toEqual([]);
    expect(localStorageMock.getItem('security-scanner-history')).toBe(JSON.stringify([]));
  });
  
  test('should delete a specific result', () => {
    const mockHistory = [
      {
        id: 'test-id-1',
        repository: 'test/repo-1',
        branch: 'main',
        timestamp: new Date().toISOString(),
        findings: [],
        summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
        status: 'completed'
      },
      {
        id: 'test-id-2',
        repository: 'test/repo-2',
        branch: 'main',
        timestamp: new Date().toISOString(),
        findings: [],
        summary: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
        status: 'completed'
      }
    ];
    
    act(() => {
      localStorageMock.setItem('security-scanner-history', JSON.stringify(mockHistory));
    });
    
    const { result } = renderHook(() => useScanStore());
    expect(result.current.history.length).toBe(2);
    
    act(() => {
      result.current.deleteResult('test-id-1');
    });
    
    expect(result.current.history.length).toBe(1);
    expect(result.current.history[0].id).toBe('test-id-2');
  });
});
