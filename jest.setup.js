// Mock for window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock for ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// Mock for scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

// Mock for IntersectionObserver
class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = IntersectionObserver;

// Mock for requestIdleCallback
window.requestIdleCallback = (callback) => {
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => 50,
    });
  }, 0);
};
window.cancelIdleCallback = (id) => {
  clearTimeout(id);
};

// Mock for localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock for sessionStorage
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock for fetch
window.fetch = jest.fn();

// Mock for URL.createObjectURL
window.URL.createObjectURL = jest.fn();

// Mock for navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(),
  },
});

// Mock for Notification
Object.defineProperty(window, 'Notification', {
  value: class Notification {
    static permission = 'granted';
    static requestPermission = jest.fn().mockResolvedValue('granted');
    constructor(title, options) {
      this.title = title;
      this.options = options;
    }
  },
});

// Mock for requestAnimationFrame
const requestAnimationFrame = (callback) => setTimeout(callback, 0);
const cancelAnimationFrame = (id) => clearTimeout(id);
window.requestAnimationFrame = requestAnimationFrame;
window.cancelAnimationFrame = cancelAnimationFrame;

// Mock for getComputedStyle
window.getComputedStyle = () => ({
  getPropertyValue: () => '',
});

// Fail tests on console errors/warns
const consoleError = console.error;
const consoleWarn = console.warn;
const consoleInfo = console.info;
const consoleDebug = console.debug;

beforeEach(() => {
  console.error = (message) => {
    consoleError(message);
    throw new Error(`Console error: ${message}`);
  };
  console.warn = (message) => {
    consoleWarn(message);
    throw new Error(`Console warn: ${message}`);
  };
  console.info = (message) => {
    consoleInfo(message);
    throw new Error(`Console info: ${message}`);
  };
  console.debug = (message) => {
    consoleDebug(message);
    throw new Error(`Console debug: ${message}`);
  };
});

afterEach(() => {
  console.error = consoleError;
  console.warn = consoleWarn;
  console.info = consoleInfo;
  console.debug = consoleDebug;
});
