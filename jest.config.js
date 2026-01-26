export default {
    testEnvironment: 'node',
    cache: false,
    cacheDirectory: '<rootDir>/.jest-cache',
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '^express-validator$': '<rootDir>/src/mocks/express-validator.js',
        '^nodemailer$': '<rootDir>/src/mocks/nodemailer.js',
    },
    transformIgnorePatterns: [],
};
