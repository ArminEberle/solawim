import type { ESLint } from 'eslint';
import type { BuildTask } from 'src/build/types/BuildTask';
import { getDefaultTaskProperties } from 'src/build/utils/getDefaultTaskProperties';

export default {
    ...getDefaultTaskProperties(__filename),
    action: async (): Promise<void> => {
        const [eslint] = await Promise.all([import('eslint')]);
        const inst = new eslint.ESLint(require('src/build/config/eslintrc').default as ESLint.Options);
        const results = await inst.lintFiles(['src/**/*.ts', 'src/**/*.tsx']);
        await eslint.ESLint.outputFixes(results);
        const formatter = await inst.loadFormatter('stylish');
        console.log(formatter.format(results));
    },
} satisfies BuildTask;
