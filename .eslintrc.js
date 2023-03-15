module.exports = {
    extends: [
        'expensify',
        'plugin:storybook/recommended',
    ],
    parser: 'babel-eslint',
    ignorePatterns: ['!.*', 'src/vendor', '.github/actions/**/index.js', 'desktop/dist/*.js', 'dist/*.js', 'node_modules/.bin/**', '.git/**'],
    env: {
        jest: true,
    },
    settings: {
        'import/extensions': [
            '.js',
            '.website.js',
            '.desktop.js',
            '.native.js',
            '.ios.js',
            '.android.js',
            '.config.js',
            '.ts',
            '.website.ts',
            '.desktop.ts',
            '.native.ts',
            '.ios.ts',
            '.android.ts',
            '.config.ts',
            '.tsx',
            '.website.tsx',
            '.desktop.tsx',
            '.native.tsx',
            '.ios.tsx',
            '.android.tsx',
            '.config.tsx',
        ],
        'import/resolver': {
            node: {
                extensions: [
                    '.js',
                    '.website.js',
                    '.desktop.js',
                    '.native.js',
                    '.ios.js',
                    '.android.js',
                    '.config.js',
                    '.ts',
                    '.website.ts',
                    '.desktop.ts',
                    '.native.ts',
                    '.ios.ts',
                    '.android.ts',
                    '.config.ts',
                    '.tsx',
                    '.website.tsx',
                    '.desktop.tsx',
                    '.native.tsx',
                    '.ios.tsx',
                    '.android.tsx',
                    '.config.tsx',
                ],
            },
        },
    },
    globals: {
        __DEV__: 'readonly',
    },
    overrides: [{
        files: ['*.ts', '*.tsx'],
        extends: ['airbnb-typescript'], // expensify uses airbnb config
        parser: '@typescript-eslint/parser',
        parserOptions: {
            project: ['./tsconfig.json'],
        },
        rules: {
            'react/jsx-filename-extension': 0,
            'react/static-property-placement': 0,
            '@typescript-eslint/naming-convention': 0,
            'rulesdir/no-inline-named-export': 0,
        },
    }],
};
