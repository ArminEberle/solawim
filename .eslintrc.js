const OFF = 0, WARN = 1, ERROR = 2;

module.exports = {
    root: true,
    ignorePatterns: [
        'depot/regdn/**',
        '**/node_modules/**',
        '*.d.ts',
        '**/dist/**',
        '**/.build-tmp/**'
    ],
    parser: '@typescript-eslint/parser',  // Specifies the ESLint parser
    plugins: [
        '@typescript-eslint',
        'unused-imports',
        'regex',
    ],
    extends: [
      'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from
        // the
        // @typescript-eslint/eslint-plugin
        'plugin:vue/vue3-recommended',
    ],
    parserOptions: {
        ecmaVersion: 2015,  // Allows for the parsing of modern ECMAScript features
        sourceType: 'module',  // Allows for the use of imports
    },
    env: {
        browser: true, node: true
    },
    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules
        // specified from the extended configs e.g.
        // '@typescript-eslint/explicit-function-return-type': 'off',
        'prefer-const': [ERROR],
        'eqeqeq': [ERROR],
        '@typescript-eslint/no-var-requires': [WARN],
        '@typescript-eslint/no-use-before-define': [OFF],
        '@typescript-eslint/no-empty-function': [OFF],
        '@typescript-eslint/consistent-type-assertions': [WARN],
        '@typescript-eslint/no-inferrable-types': [OFF],
        // the following rule is replaced by the regex/invalid rule afterwards, since the regex rule has an autofix
        // 'no-restricted-imports': [ERROR, {
        //     // Importing from the source folder is always an error.
        //     // Import from the dist folder of the yarn module instead
        //     patterns: ['**/src/ts/**']
        // }],
        'regex/invalid': [
            'error', [{
                'regex': 'import[^@]*@wesense-.*(\/src\/ts\/)',
                'message': 'importing from src/ts does not work in the cluster',
                'replacement': {
                    function: 'text.replace(\'/src/ts/\', \'/dist/\')'
                }
              }
            ]
          ],
        'for-direction': [ERROR],
        'no-async-promise-executor': [WARN],
        'no-await-in-loop': [WARN],
        'no-cond-assign': [ERROR],
        // set this to ERROR when all PRs are switched to this eslint
        'no-constant-condition': [WARN],
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
        'no-irregular-whitespace': [ERROR, {skipStrings: false, skipComments: false, skipRegExps: false, skipTemplates: false}],
        'no-misleading-character-class': [ERROR],
        'no-obj-calls': [ERROR],
        // set this to ERROR when all PRs are switched to this eslint
        'no-prototype-builtins': [WARN],
        'no-regex-spaces': [ERROR],
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
            'default': ['field', 'constructor', 'method']
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
                // Off because use interfaces for objects that come directly
                // from sql databases which are usually not camel cased.
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
        'no-warning-comments': [ERROR, {'terms': ['fixme', 'xxx'], 'location': 'start'}],
        'max-len': [ERROR, 200, { "ignoreTemplateLiterals": true }],
        '@typescript-eslint/semi': [ERROR],
        '@typescript-eslint/comma-dangle': [ERROR, 'always-multiline'],
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
        'array-bracket-spacing': [ERROR],
        'block-spacing': [ERROR, 'always'],
        '@typescript-eslint/brace-style': [ERROR, '1tbs', {allowSingleLine: true}],
        'computed-property-spacing': [ERROR],
        'eol-last': [ERROR, 'never'],
        '@typescript-eslint/func-call-spacing': [ERROR],
        '@typescript-eslint/indent': [ERROR],
        'jsx-quotes': [ERROR],
        'key-spacing': [ERROR],
        'linebreak-style': [ERROR],
        '@typescript-eslint/lines-between-class-members': [ERROR, 'always', {exceptAfterSingleLine: true}],
        'newline-per-chained-call': [ERROR, { ignoreChainWithDepth: 1}],
        '@typescript-eslint/no-extra-semi': [ERROR],
        'no-lonely-if': [ERROR],
        'no-multiple-empty-lines': [ERROR],
        'no-trailing-spaces': [ERROR],
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
        '@typescript-eslint/space-infix-ops': [ERROR],
        'space-before-blocks': [ERROR],
        'unicode-bom': [ERROR],
        'wrap-regex': [ERROR],
        // 'sort-imports': [ERROR, {ignoreCase: true}],
        '@typescript-eslint/indent': ['error', 4, {'FunctionDeclaration': {'parameters': 'first'}, 'FunctionExpression': {'parameters': 'first'}}],
        'no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
            'warn',
            { 'vars': 'all', 'varsIgnorePattern': '^_', 'args': 'after-used', 'argsIgnorePattern': '^_' }
        ],
    }
};
