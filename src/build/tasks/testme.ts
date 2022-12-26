import type { Task } from 'src/build/types/Task';

export default {
    action: (name: string) => {
        console.log('Testme Task ' + name);
        return new Promise(resolve => setTimeout(resolve, 1000));
    },
    desc: 'This my description',
} as Task;