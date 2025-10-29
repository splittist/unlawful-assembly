import { vi } from 'vitest';

// Global test setup

// Mock console methods for cleaner test output (optional)
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
  
  // Optional: suppress console.error and console.warn in tests unless needed
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  // Restore console methods after each test
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Mock file reading operations for browser environment
Object.defineProperty(window, 'FileReader', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    readAsArrayBuffer: vi.fn(),
    readAsText: vi.fn(),
    onload: null,
    onerror: null,
    result: null
  }))
});

// Mock Blob and File constructors
Object.defineProperty(window, 'Blob', {
  writable: true,
  value: vi.fn().mockImplementation((content, options) => ({
    size: content?.[0]?.length || 0,
    type: options?.type || '',
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    text: () => Promise.resolve(content?.[0] || ''),
    slice: vi.fn()
  }))
});

Object.defineProperty(window, 'File', {
  writable: true,
  value: vi.fn().mockImplementation((content, filename, options) => ({
    name: filename,
    size: content?.[0]?.length || 0,
    type: options?.type || '',
    lastModified: Date.now(),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    text: () => Promise.resolve(content?.[0] || ''),
    slice: vi.fn()
  }))
});

// Mock FileSaver.js saveAs function
vi.mock('file-saver', () => ({
  saveAs: vi.fn()
}));

// Mock URL.createObjectURL for file downloads
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'mock-object-url')
});

Object.defineProperty(window.URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn()
});

// Extend expect with custom matchers (optional)
import { expect } from 'vitest';

expect.extend({
  toBeValidDocx(received: ArrayBuffer) {
    const pass = received instanceof ArrayBuffer && received.byteLength > 0;
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid DOCX`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid DOCX (ArrayBuffer with content)`,
        pass: false,
      };
    }
  },
});