
export type LocalTask = Omit<Task, 'localTasks'> & {
    name: string,
};

export type Task = {
    dependencies?: string[];
    action: (taskName: string) => Promise<void>;
    desc?: string,
};


export const isTask = (x: any): x is Task => {
    return typeof x === 'object'
        && ('dependencies' in x || 'action' in x);
};