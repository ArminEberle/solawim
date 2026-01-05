import fs from 'fs';

/**
 * Creates the directory for the given directory path if it does not already exist.
 * @param dirPath
 */
export const ensureDirExists = async (dirPath: string): Promise<void> => {
    try {
        await fs.promises.access(dirPath, fs.constants.F_OK);
    } catch (err) {
        await fs.promises.mkdir(dirPath, { recursive: true });
    }
};
