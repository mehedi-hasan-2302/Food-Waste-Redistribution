import 'reflect-metadata';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'food_waste_test';
process.env.DB_USERNAME = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_EXPIRES_IN = '1h';

// Global test setup
beforeAll(async () => {
  // Any global setup needed for tests
});

afterAll(async () => {
  // Any global cleanup needed after tests
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});
