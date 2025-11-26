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
      "^@openimis/(.*)$": "<rootDir>/src/modules/$1",
    },
  
    testEnvironment: "jsdom",
  
    setupFilesAfterEnv: ["<rootDir>/src/tests/setupTests.js"],
  
    testPathIgnorePatterns: [
      "/node_modules/",
      "/dist/",
    ],

    collectCoverage: true,
  
    collectCoverageFrom: [
      "src/**/*.{js,jsx}",
      "!src/index.js",
      "!src/**/stories/**",
      "!src/**/mocks/**",
    ],
  
    coverageDirectory: "<rootDir>/coverage/",
  
    coverageReporters: [
      "json",
      "lcov",
      "text",
      "clover"
    ],
  
    coverageThreshold: {
      global: {
        branches: 20,
        functions: 20,
        lines: 30,
        statements: 30,
      },
    },
  };
  