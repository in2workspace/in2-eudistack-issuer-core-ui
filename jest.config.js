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
      "!src/app/core/mocks/**"
    ],
    testPathIgnorePatterns: [
      '/node_modules/',
      '/dist/',
      '/src/app/core/mocks/',
      // '/src/app/app',
      // '/src/app/core/(?!models)',
      // '/src/app/core/services/',
      // // '/src/app/features/',
      // '/src/app/features/(?!credential-details)',
      // '/src/app/features/credential-details/',
      // '/src/app/features/credential-details/helpers',
      // // '/src/app/features/credential-details/',
      // '/src/app/features/credential-details/credential-details.routes',
      // '/src/app/features/credential-details/credential-details.component',
      // '/src/app/shared/',
    ]
   };
