/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jest-environment-jsdom",
  transform: { "^.+\\.(js|jsx|ts|tsx)$": "babel-jest" },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json"],
  testMatch: ["**/__tests__/**/*.(js|jsx|ts|tsx)", "**/?(*.)+(test).(js|jsx|ts|tsx)"],
  roots: ["<rootDir>/src"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
    "\\.(png|jpg|jpeg|svg)$": "<rootDir>/src/__mocks__/fileMock.js"
  }
};