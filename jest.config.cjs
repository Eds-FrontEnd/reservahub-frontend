module.exports = {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.[tj]sx?$": [
      "babel-jest",
      {
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          ["@babel/preset-react", { runtime: "automatic" }],
          "@babel/preset-typescript",
        ],
      },
    ],
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
