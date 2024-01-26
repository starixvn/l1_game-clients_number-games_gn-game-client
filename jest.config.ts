export default {
    collectCoverageFrom: ["**/*.{js,jsx,ts,tsx}", "!**/*.d.ts", "!**/node_modules/**"],
    moduleNameMapper: {
        /* Handle CSS imports (with CSS modules)
        https://jestjs.io/docs/webpack#mocking-css-modules */
        "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",

        // Handle CSS imports (without CSS modules)
        "^.+\\.(css|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",

        /* Handle image imports
        https://jestjs.io/docs/webpack#handling-static-assets */
        "^.+\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js",
    },
    testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
    moduleFileExtensions: ["ts", "tsx", "js"],
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest",
    },
    testMatch: ["**/*.(test|spec).(ts|tsx)"],
    globals: {
        "ts-jest": {
            useBabelrc: true,
        },
    },
    testEnvironment: "jsdom",
    coveragePathIgnorePatterns: ["node_modules", ".d.ts", ".next", "coverage", "public", ".config.ts", ".config.js"],
    setupFilesAfterEnv: ["jest-extended", "./__mocks__/global.js"],
    coverageReporters: ["json", "lcov", "text", "text-summary"],
    transformIgnorePatterns: ["/node_modules/", "^.+\\.module\\.(css|sass|scss)$"],
    testResultsProcessor: "jest-sonar-reporter",
    resetMocks: false,
};
