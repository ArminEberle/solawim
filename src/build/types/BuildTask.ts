export type BuildTaskLog = (text: string | Error, isError?: boolean, skipEmptyLines?: boolean) => void;

export type BuildTask = {
    name: string;
    outputFolder?: string;
    description?: string;
    watchMode?: boolean;
    runMode?: boolean;
    actionBeforeDependencies?: (taskName: string, taskLog: BuildTaskLog) => PromiseLike<void>;
    dependencies?: BuildTask[];
    action?: (taskName: string, taskLog: BuildTaskLog) => void | PromiseLike<void>;
};
