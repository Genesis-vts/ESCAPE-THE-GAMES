/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/scripts/**',
    '!src/**/__tests__/**',
    '!src/types/**',
    // Adaptadores reais de provedor: são invólucros finos sobre SDKs externos e
    // só executam com credenciais. São exercitados em staging (teste de fumaça
    // com envio real), não no teste unitário — ver MVP_SPEC.md §6.
    '!src/notifications/providers/twilioSmsProvider.ts',
    '!src/notifications/providers/sendgridEmailProvider.ts',
    '!src/notifications/providers/fcmPushProvider.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 55,
      functions: 70,
      lines: 70,
    },
  },
  clearMocks: true,
  testTimeout: 15000,
};
