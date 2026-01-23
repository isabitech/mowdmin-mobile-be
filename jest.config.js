export default {
    testEnvironment: 'node',
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
        '^express-validator$': '<rootDir>/src/__tests__/__mocks__/express-validator.js',
        '^nodemailer$': '<rootDir>/src/__tests__/__mocks__/nodemailer.js',
    },
    transformIgnorePatterns: [],
};
