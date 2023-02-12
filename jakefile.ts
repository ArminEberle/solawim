// import { desc, task } from 'jake';
import glob from 'glob';
import path from 'path';
import { isTask } from 'src/build/types/Task';

const tasksPath = path.join(__dirname, 'src/build/tasks');

void (async() => {
    const ts = glob.sync(path.join(tasksPath, '**/*.ts'));
    for (const taskPath of ts) {
        const pp = path.parse(taskPath);
        const prefix = pp.dir.substring(tasksPath.length);
        const name = [prefix, pp.name].join('/').replace(/^\//, '');

        const t = (await import(taskPath)).default;
        if (!isTask(t)) {
            console.error(`Task file ${name} does not return a valid task definition. Ignoring it...`);
            return;
        }

        desc(t.desc ?? name);
        task(name, t.dependencies ?? [], async() => {
            await t.action(name);
            complete();
        }, {
            async: true,
        });
    }
})();

export { };
