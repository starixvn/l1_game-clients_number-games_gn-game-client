const configs = {
    collectCoverageFrom: ["**/*.{js,jsx,ts,tsx}", "!**/*.d.ts", "!**/node_modules/**"],
    moduleNameMapper: {
        "^.+\\.(css|sass|scss)$": "identity-obj-proxy",
        "swiper/css": "identity-obj-proxy",
        "swiper/css/pagination": "identity-obj-proxy",
        "swiper/react": "<rootDir>/node_modules/swiper/swiper.js",
    },
    testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
    moduleFileExtensions: ["ts", "tsx", "js"],
    transform: {
        "^.+\\.(js|jsx|ts|tsx)$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.jest.json",
            },
        ],
    },
    testMatch: ["**/*.(test|spec).(ts|tsx)"],
    testEnvironment: "jsdom",
    coveragePathIgnorePatterns: ["node_modules", ".d.ts", ".next", "coverage", "public", ".config.ts", ".config.js"],
    setupFilesAfterEnv: ["jest-extended", "./__mocks__/global.tsx"],
    coverageReporters: ["json", "lcov", "text", "text-summary"],
    transformIgnorePatterns: ["/node_modules/", "^.+\\.module\\.(css|sass|scss)$"],
    testResultsProcessor: "jest-sonar-reporter",
    resetMocks: false,
    snapshotResolver: "./__mocks__/snapshot.ts",
};

export default configs;
