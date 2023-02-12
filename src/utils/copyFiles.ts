import fs from 'fs';
import path from 'path';

async function copyFile(source: string, target: string): Promise<void> {
    // If target is a directory, a new file with the same name will be created
    if (fs.existsSync(target)) {
        if ((await fs.promises.lstat(target))
            .isDirectory()) {
            throw new Error(target + ' is a directory');
        }
    }

    await fs.promises.writeFile(target, await fs.promises.readFile(source));
    console.log('copied to file ' + target);
}

export async function copyFolderRecursive(source: string, target: string): Promise<void> {
    let files = [];

    // Check if folder needs to be created or integrated
    await fs.promises.mkdir(target, { recursive: true });

    // Copy
    if ((await fs.promises.lstat(source))
        .isDirectory()) {
        files = await fs.promises.readdir(source);
        await Promise.all(
            files.map(file => (async function() {
                const curSource = path.join(source, file);
                const targetPath = path.join(target, file);
                if ((await fs.promises.lstat(curSource))
                    .isDirectory()) {
                    await copyFolderRecursive(curSource, targetPath);
                } else {
                    await copyFile(curSource, targetPath);
                }
            })())
        );
    }
}