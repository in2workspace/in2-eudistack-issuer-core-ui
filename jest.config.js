module.exports = {
    preset: "jest-preset-angular",
    roots: ["src"],
    setupFilesAfterEnv: ["<rootDir>/src/setup-jest.ts"],
    moduleNameMapper: {
      "@app/(.*)": "<rootDir>/src/app/$1",
      "@assets/(.*)": "<rootDir>/src/assets/$1",
      "@core/(.*)": "<rootDir>/src/app/core/$1",
      "@env": "<rootDir>/src/environments/environment",
      "@src/(.*)": "<rootDir>/src/src/$1",
      "@services/(.*)": "<rootDir>/src/app/core/services/$1",
      "@helpers/(.*)": "<rootDir>/src/app/helpers/$1",
      "@shared/(.*)": "<rootDir>/src/app/shared/$1",
      '^src/(.*)$': '<rootDir>/src/$1'
    },
    collectCoverage:true,
    coverageDirectory: "./coverage/app",
    coverageReporters: ["lcov", "text-summary", "cobertura", "html"],
    collectCoverageFrom: [
      "src/app/**/*.ts",
      "!<rootDir>/node_modules/",
      "!<rootDir>/test/",
      "!src/app/**/*.module.ts",
    ],
    testPathIgnorePatterns: [
      '/node_modules/',
      '/dist/',
      // '/src/app/app',
      // '/src/app/core/',
      // '/src/app/features/',
      // '/src/app/features/(?!credencial-offer)',
      // '/src/app/features/(?!credential-offer-onboarding)',
      // '/src/app/shared/',
    ]
   };
   