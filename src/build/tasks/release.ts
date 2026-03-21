import fs from 'node:fs';
import path from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import readline from 'node:readline/promises';
import SftpClient from 'ssh2-sftp-client';
import buildProduction from 'src/build/tasks/buildProduction';
import type { BuildTask, BuildTaskLog } from 'src/build/types/BuildTask';
import { getDefaultTaskProperties } from 'src/build/utils/getDefaultTaskProperties';

type ProductionServerConfig = {
    user: string;
    password: string;
    server: string;
    port: number;
    path: string;
};

const productionServerConfigPath = path.join(process.cwd(), 'productionserver.json');
const productionServerExampleConfigPath = path.join(process.cwd(), 'productionserver.example.json');
const localPluginPath = path.join(process.cwd(), '.build-tmp/plugin');
const releaseBackupBasePath = path.join(process.cwd(), '.build-tmp/release-backup');

let preparedReleaseConfig: ProductionServerConfig | undefined;
let preparedReleaseTimestamp: string | undefined;

type BasicSftpClient = {
    connect(config: { host: string; port: number; username: string; password: string }): Promise<unknown>;
    end(): Promise<unknown>;
    exists(pathName: string): Promise<false | string>;
    mkdir(pathName: string, recursive?: boolean): Promise<unknown>;
    rmdir(pathName: string, recursive?: boolean): Promise<unknown>;
    rename(fromPath: string, toPath: string): Promise<unknown>;
    uploadDir(srcDir: string, dstDir: string): Promise<unknown>;
    downloadDir(srcDir: string, dstDir: string): Promise<unknown>;
};

const timestampForFolderName = () => {
    return new Date().toISOString().replace(/[:.]/g, '-');
};

const loadProductionServerConfig = (): ProductionServerConfig => {
    if (!fs.existsSync(productionServerConfigPath)) {
        throw new Error(
            `Missing ${productionServerConfigPath}. Create it from ${productionServerExampleConfigPath} before running relase.`,
        );
    }

    const parsedConfig = JSON.parse(fs.readFileSync(productionServerConfigPath, 'utf8')) as Partial<ProductionServerConfig>;

    if (!parsedConfig.user || !parsedConfig.password || !parsedConfig.server || !parsedConfig.path) {
        throw new Error(`productionserver.json must contain user, password, server and path.`);
    }

    if (typeof parsedConfig.port !== 'number' || !Number.isInteger(parsedConfig.port) || parsedConfig.port <= 0) {
        throw new Error(`productionserver.json must contain a positive integer port.`);
    }

    return {
        user: parsedConfig.user,
        password: parsedConfig.password,
        server: parsedConfig.server,
        port: parsedConfig.port,
        path: parsedConfig.path,
    };
};

const createSftpClient = (): BasicSftpClient => {
    return new SftpClient() as BasicSftpClient;
};

const promptForConfirmation = async () => {
    const readlineInterface = readline.createInterface({ input, output });

    try {
        const answer = await readlineInterface.question('Is this serious? This will deploy to production. [y/N] ');
        return answer.trim().toLowerCase() === 'y';
    } finally {
        readlineInterface.close();
    }
};

const removeRemoteDirectoryIfExists = async (client: BasicSftpClient, remotePath: string) => {
    const existingRemoteEntry = await client.exists(remotePath);
    if (existingRemoteEntry) {
        await client.rmdir(remotePath, true);
    }
};

const backupCurrentRemoteState = async (
    client: BasicSftpClient,
    config: ProductionServerConfig,
    backupPath: string,
    taskLog: BuildTaskLog,
) => {
    taskLog(`Downloading current production state to ${backupPath}`);
    fs.mkdirSync(backupPath, { recursive: true });
    await client.downloadDir(config.path, backupPath);
};

const replaceRemoteFolder = async (
    client: BasicSftpClient,
    config: ProductionServerConfig,
    timestamp: string,
    taskLog: BuildTaskLog,
) => {
    if (!fs.existsSync(localPluginPath)) {
        throw new Error(`Local build output ${localPluginPath} does not exist.`);
    }

    const remoteParentPath = path.posix.dirname(config.path);
    const remoteFolderName = path.posix.basename(config.path);
    const remoteUploadPath = path.posix.join(remoteParentPath, `.${remoteFolderName}.release-upload-${timestamp}`);
    const remotePreviousPath = path.posix.join(remoteParentPath, `.${remoteFolderName}.release-previous-${timestamp}`);

    taskLog(`Preparing remote upload directory ${remoteUploadPath}`);
    await client.mkdir(remoteParentPath, true);
    await removeRemoteDirectoryIfExists(client, remoteUploadPath);
    await removeRemoteDirectoryIfExists(client, remotePreviousPath);
    await client.mkdir(remoteUploadPath, true);

    taskLog(`Uploading ${localPluginPath} to ${config.server}:${config.path}`);
    await client.uploadDir(localPluginPath, remoteUploadPath);

    taskLog(`Replacing remote folder ${config.path}`);
    if (await client.exists(config.path)) {
        await client.rename(config.path, remotePreviousPath);
    }
    await client.rename(remoteUploadPath, config.path);
    await removeRemoteDirectoryIfExists(client, remotePreviousPath);
};

export default {
    ...getDefaultTaskProperties(__filename),
    dependencies: [buildProduction],
    actionBeforeDependencies: async () => {
        const isSerious = await promptForConfirmation();
        if (!isSerious) {
            console.log('relase: Release cancelled.');
            process.exit(0);
        }

        preparedReleaseConfig = loadProductionServerConfig();
        preparedReleaseTimestamp = timestampForFolderName();
    },
    action: async (_taskName: string, taskLog: BuildTaskLog) => {
        if (!preparedReleaseConfig || !preparedReleaseTimestamp) {
            throw new Error(`Release configuration was not prepared before running the relase task.`);
        }

        const backupPath = path.join(releaseBackupBasePath, preparedReleaseTimestamp);
        const sftpClient = createSftpClient();
        let isConnected = false;

        try {
            taskLog(`Connecting to ${preparedReleaseConfig.server}:${preparedReleaseConfig.port}`);
            await sftpClient.connect({
                host: preparedReleaseConfig.server,
                port: preparedReleaseConfig.port,
                username: preparedReleaseConfig.user,
                password: preparedReleaseConfig.password,
            });
            isConnected = true;

            await backupCurrentRemoteState(sftpClient, preparedReleaseConfig, backupPath, taskLog);
            await replaceRemoteFolder(sftpClient, preparedReleaseConfig, preparedReleaseTimestamp, taskLog);
        } finally {
            if (isConnected) {
                await sftpClient.end();
            }
        }
    },
} satisfies BuildTask;
