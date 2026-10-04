module.exports = {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.[tj]sx?$": "babel-jest",
  },

  transformIgnorePatterns: ["/node_modules/(?!(@mui|@emotion)/)"],

  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],

  moduleNameMapper: {
    "\\.(css|scss|sass)$": "<rootDir>/src/tests/styleMock.cjs",
    "\\.(webp|jpg|jpeg|gif|svg|avif)$": "<rootDir>/src/tests/fileMock.cjs",
  },

  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],

  testMatch: ["**/*.test.(ts|tsx)"],

  extensionsToTreatAsEsm: [],

  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
};
