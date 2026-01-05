import path from 'path';
import { ensureDirExists } from 'src/utils/ensureDirExists';

/**
 * Creates the parent directory for the given file path if it does not already exist.
 * @param filePath
 */
export const ensureParentDirExists = async (filePath: string): Promise<void> => {
    const dirName = path.dirname(filePath);
    return ensureDirExists(dirName);
};
