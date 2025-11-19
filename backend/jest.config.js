// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@users/(.*)$': '<rootDir>/users/$1',
    '^@tasks/(.*)$': '<rootDir>/tasks/$1',
    '^@events/(.*)$': '<rootDir>/events/$1',
    '^@common/(.*)$': '<rootDir>/common/$1',
  },
};