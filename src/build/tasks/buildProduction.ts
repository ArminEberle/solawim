
import build from 'src/build/tasks/build';
import clean from 'src/build/tasks/clean';
import copyPhpCode from 'src/build/tasks/copyPhpCode';
import rewriteSolawimPhp from 'src/build/tasks/rewriteSolawimPhp';

export default {
    action: async() => {
        clean.action();
        await build.action('asd');
        await copyPhpCode.action();
        rewriteSolawimPhp.action();
    },
};