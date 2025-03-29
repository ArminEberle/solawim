import type { Config as SwcConfig } from '@swc/core';
import type { Config as JestConfig } from 'jest';
import tsconfig from 'tsconfig.json';

const swcConfig: SwcConfig = {
    jsc: {
        parser: {
            decorators: true,
            dynamicImport: true,
            syntax: 'typescript',
            tsx: true,
        },
        target: 'es2019',
        keepClassNames: true,
    },
};

const baseOutPath = '.build-tmp/test';

const jestConfig: JestConfig = {
    roots: ['<rootDir>'],
    modulePaths: [tsconfig.compilerOptions.baseUrl],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    moduleDirectories: [__dirname, 'node_modules'],
    injectGlobals: true,
    testRegex: 'src/(.+/)*.+\\.test\\.tsx?$',
    modulePathIgnorePatterns: ['<rootDir>/depot/', '<rootDir>/.build-tmp/'],
    testPathIgnorePatterns: ['/node_modules/', '<rootDir>/.build-tmp/'],
    testEnvironment: 'node',
    collectCoverage: false,
    collectCoverageFrom: undefined,
    coverageDirectory: baseOutPath + '/coverage',
    cacheDirectory: baseOutPath + '/jest-cache',
    transform: {
        '\\.tsx?$': ['@swc/jest', swcConfig as Record<string, unknown>],
    },
    reporters: ['default'],
};

export default jestConfig;
