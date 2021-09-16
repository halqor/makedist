// https://eslint.org/docs/user-guide/configuring
module.exports = {
    root: true,
    env: {
        node: true,
        // mocha: true,
    },
    plugins: [
        // "mocha"
        "import",
    ],
    extends: [
        'airbnb-base',
        // 'plugin:mocha/recommended',
    ],
    rules: {
        // 'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        // 'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-console': 'off',
        'max-len': 'off',
        indent: ['error', 4],
        // 'import/no-commonjs': 'off',
        'import/extensions': 'off',
        'import/no-commonjs': 2,
        'import/no-unresolved': 2,
        'import/prefer-default-export': 'off',
        // 'import/no-default-export': 'error',
        'import/no-default-export': 'off',
        // 'prefer-arrow-callback': 'off',
        'func-names': ['error', 'as-needed'],
        'class-methods-use-this': 'off',
    },
    parserOptions: {
        parser: 'babel-eslint',
    },
};
