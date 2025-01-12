module.exports = {
  roots: ["<rootDir>/src"],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleNameMapper: {
    "@/(.*)$": "<rootDir>/src/$1",
  },
  testTimeout: 60 * 1000,
  globalSetup: "<rootDir>/src/tests/setup.ts",
};
