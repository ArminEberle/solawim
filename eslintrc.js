const OFF = 0,
    WARN = 1,
    ERROR = 2;

module.exports = {
    root: true,
    ignorePatterns: [
        '**/node_modules/**',
        '*.d.ts',
        '**/dist/**',
        '**/.build-tmp/**',
        'depot/**/*',
        'src/pqs-communication/structs',
        'src/build/.eslintrc.js',
    ],
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    // plugins: {
    //     '@typescript-eslint': (require('@typescript-eslint/eslint-plugin')) as any,
    //     'unused-imports': (require('eslint-plugin-unused-imports')) as any,
    //     'no-relative-import-paths': (require('eslint-plugin-no-relative-import-paths')) as any,
    //     'simple-import-sort': (require('eslint-plugin-simple-import-sort')) as any,
    //     'regex': (require('eslint-plugin-regex')) as any,
    // },
    plugins: [
        '@typescript-eslint',
        'unused-imports',
        'no-relative-import-paths',
        'simple-import-sort',
        'regex',
    ],
    extends: [
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended', 
        'prettier',
        // Uses the recommended rules from
        // the
        // @typescript-eslint/eslint-plugin
    ],
    parserOptions: {
        ecmaVersion: 2015, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
        project: ['./tsconfig.json'],
    },
    env: {
        browser: true, node: true,
    },
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules
        // specified from the extended configs e.g.
        // '@typescript-eslint/explicit-function-return-type': 'off',
        'prefer-const': [ERROR],
        'eqeqeq': [ERROR],
        '@typescript-eslint/explicit-module-boundary-types': [WARN],
        '@typescript-eslint/no-var-requires': [WARN],
        '@typescript-eslint/no-use-before-define': [OFF],
        '@typescript-eslint/no-empty-function': [OFF],
        '@typescript-eslint/consistent-type-assertions': [WARN],
        '@typescript-eslint/no-inferrable-types': [OFF],
        '@typescript-eslint/no-unnecessary-type-constraint': [WARN], // Should be changed to ERROR, as this is the default now
        '@typescript-eslint/ban-types': [ERROR],
        '@typescript-eslint/consistent-type-imports': [ERROR],
        'for-direction': [ERROR],
        'max-statements': [WARN, {
            max: 100,
        }],
        'max-depth': [WARN],
        'no-nested-ternary': [ERROR],
        'no-mixed-operators': [WARN],
        'require-await': [ERROR],
        'no-return-await': [ERROR],
        '@typescript-eslint/no-misused-promises': [
            ERROR,
            {
                checksConditionals: true,
                checksVoidReturn: false,
            },
        ],
        '@typescript-eslint/await-thenable': [ERROR],
        '@typescript-eslint/no-floating-promises': [WARN],
        'no-async-promise-executor': [WARN],
        'no-await-in-loop': [WARN],
        'no-cond-assign': [ERROR],
        // set this to ERROR when all PRs are switched to this eslint
        'no-constant-condition': [ERROR],
        'no-control-regex': [ERROR],
        'no-debugger': [ERROR],
        'no-dupe-args': [ERROR],
        'no-dupe-else-if': [ERROR],
        'no-dupe-keys': [ERROR],
        'no-duplicate-case': [ERROR],
        'no-empty': [ERROR],
        'no-empty-character-class': [ERROR],
        'no-ex-assign': [ERROR],
        'no-func-assign': [ERROR],
        'no-import-assign': [ERROR],
        'no-inner-declarations': [ERROR],
        'no-invalid-regexp': [ERROR],
        'no-irregular-whitespace': [ERROR, { skipStrings: false, skipComments: false, skipRegExps: false, skipTemplates: false }],
        'no-misleading-character-class': [ERROR],
        'no-obj-calls': [ERROR],
        // set this to ERROR when all PRs are switched to this eslint
        'no-prototype-builtins': [WARN],
        'no-regex-spaces': [ERROR],
        'no-console': [WARN],
        'no-sparse-arrays': [ERROR],
        'no-template-curly-in-string': [ERROR],
        // set this to ERROR when all PRs are switched to this eslint
        'no-unexpected-multiline': [WARN],
        // set this to ERROR when all PRs are switched to this eslint
        'no-unreachable': [WARN],
        'no-unsafe-finally': [ERROR],
        'no-unsafe-negation': [ERROR],
        // set this to ERROR when all PRs are switched to this eslint
        'require-atomic-updates': [WARN],
        'use-isnan': [ERROR],
        'valid-typeof': [ERROR],
        // '': [ERROR],

        //////////////////////
        // code style rules //
        //////////////////////
        // this rule won't work in Typescript as we need parens around casts once in a while
        // 'no-extra-parens': [ERROR],
        // Off because we use interfaces for objects that come directly
        // from sql databases which are usually not  camel cased.
        '@typescript-eslint/camelcase': [OFF],
        '@typescript-eslint/member-ordering': [WARN, {
            'default': ['field', 'constructor', 'method'],
        }], // Only FIXME and XXX are forbidden. TODO is still allowed
        '@typescript-eslint/interface-name-prefix': [OFF],
        '@typescript-eslint/naming-convention': [ERROR,
            {
                selector: 'default',
                format: ['camelCase', 'PascalCase'],
                leadingUnderscore: 'allow',
            },
            {
                selector: 'typeLike',
                format: ['PascalCase', 'UPPER_CASE'],
            },
            {
                selector: ['property', 'variable'],
                // TODO
                // format: ['camelCase'],
                format: [],
            },
            {
                selector: 'interface',
                format: ['PascalCase'],
            },
            {
                selector: 'enumMember',
                format: ['PascalCase', 'UPPER_CASE'],
            },
        ],
        'no-warning-comments': [ERROR, { 'terms': ['fixme', 'xxx'], 'location': 'start' }],
        'max-len': [ERROR, 200, { 'ignoreTemplateLiterals': true }],
        '@typescript-eslint/semi': [ERROR],
        '@typescript-eslint/comma-dangle': [ERROR, 'always'],
        '@typescript-eslint/comma-spacing': [ERROR],
        'comma-style': [ERROR],
        'no-trailing-spaces': [ERROR],
        '@typescript-eslint/keyword-spacing': [ERROR],
        'curly': [ERROR],
        'dot-location': [ERROR, 'property'],
        'dot-notation': [ERROR],
        'no-else-return': [ERROR],
        'no-extra-label': [ERROR],
        'no-unused-labels': [ERROR],
        'no-floating-decimal': [ERROR],
        'no-implicit-coercion': [ERROR],
        'no-multi-spaces': [ERROR],
        'no-self-assign': [ERROR],
        'no-useless-return': [ERROR],
        'yoda': [ERROR],
        'block-spacing': [ERROR, 'always'],
        '@typescript-eslint/brace-style': [ERROR, '1tbs', { allowSingleLine: true }],
        'computed-property-spacing': [ERROR],
        'eol-last': [ERROR, 'never'],
        '@typescript-eslint/func-call-spacing': [ERROR],
        '@typescript-eslint/indent': [ERROR],
        'jsx-quotes': [ERROR],
        'key-spacing': [ERROR],
        'linebreak-style': [ERROR],
        '@typescript-eslint/lines-between-class-members': [ERROR, 'always', { exceptAfterSingleLine: true }],
        'newline-per-chained-call': [ERROR, { ignoreChainWithDepth: 3 }],
        '@typescript-eslint/no-extra-semi': [ERROR],
        'no-lonely-if': [ERROR],
        'no-multiple-empty-lines': [ERROR],
        'no-unneeded-ternary': [ERROR],
        'no-whitespace-before-property': [ERROR],
        'object-curly-spacing': [ERROR, 'always'],
        'one-var-declaration-per-line': [ERROR],
        'operator-linebreak': [ERROR, 'before'],
        'padded-blocks': [ERROR, 'never'],
        '@typescript-eslint/quotes': [ERROR, 'single'],
        'semi-style': [ERROR],
        'space-before-blocks': [ERROR],
        'space-before-function-paren': [ERROR, 'never'],
        'space-in-parens': [ERROR, 'never'],
        'space-infix-ops': OFF,
        '@typescript-eslint/space-infix-ops': [WARN],
        'unicode-bom': [ERROR],
        'wrap-regex': [ERROR],
        // 'sort-imports': [ERROR, {ignoreCase: true}],
        'no-unused-vars': 'off',
        'regex/invalid': [
            'error', [
                {
                    // prevent loading lodash completely
                    regex: 'from \'lodash\';',
                    message: 'Please only import from lodash with direct imports, e.g. `import exists from \'lodash/exists\';`',
                },
            ],
        ],
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
            'warn',
            { 'vars': 'all', 'varsIgnorePattern': '^_', 'args': 'after-used', 'argsIgnorePattern': '^_' },
        ],
        'no-relative-import-paths/no-relative-import-paths': [
            ERROR,
            {
                'allowSameFolder': false,
            },
        ],
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
    },
};