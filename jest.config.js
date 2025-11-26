module.exports = {
    verbose: true,
    moduleFileExtensions: ["js", "jsx", "json"],
  
    transform: {
      "^.+\\.[jt]sx?$": "babel-jest",
    },
  
    transformIgnorePatterns: [
      "node_modules/(?!(lodash-es)/)",
    ],
  
    moduleNameMapper: {
      "\\.(css|scss|sass|less)$": "identity-obj-proxy",
      "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/tests/mocks/fileMock.js"
    },
  
    testEnvironment: "jsdom",
  
    setupFilesAfterEnv: ["<rootDir>/tests/setupTests.js"],
  
    testMatch: [
      "**/tests/**/*.test.js",
      "**/tests/**/*.test.jsx"
    ],
  
    collectCoverage: true,
  
    collectCoverageFrom: [
      "src/**/*.{js,jsx}",
      "!src/index.js",
      "!src/**/stories/**",
      "!src/**/mocks/**",
    ],
  
    coverageDirectory: "<rootDir>/coverage/",
  
    coverageReporters: ["json", "lcov", "text", "clover"],
  
    coverageThreshold: {
      global: {
        branches: 20,
        functions: 20,
        lines: 30,
        statements: 30,
      },
    },
  };
  