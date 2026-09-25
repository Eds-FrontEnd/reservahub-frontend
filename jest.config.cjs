module.exports = {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.(ts|tsx)$": [
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

  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],

  moduleNameMapper: {
    "\\.(css|scss|sass)$": "<rootDir>/src/tests/styleMock.cjs",
  },

  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],

  testMatch: ["**/*.test.(ts|tsx)"],
};
