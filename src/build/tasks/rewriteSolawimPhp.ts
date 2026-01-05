import fs from 'fs';
import path from 'path';
import { finalPluginPath, viteOutPath } from 'src/build/config/buildConfig';
import copyPhpCode from 'src/build/tasks/copyPhpCode';
import type { BuildTask } from 'src/build/types/BuildTask';
import { getDefaultTaskProperties } from 'src/build/utils/getDefaultTaskProperties';
import { copyFile } from 'src/utils/copyFiles';

export default {
    ...getDefaultTaskProperties(__filename),
    action: async () => {
        const memberFiles = await findPageFiles('solawim_member');
        const manageFiles = await findPageFiles('solawim_manage');

        const solawimPhpPath = path.resolve(finalPluginPath, 'solawim.php');
        let fileText = (await fs.promises.readFile(solawimPhpPath)).toString();

        const date = new Date();
        const dStamp = `${date.getUTCFullYear()}${date.getUTCMonth()}${date.getUTCDay()}${date.getUTCHours()}${date.getUTCMinutes()}${date.getUTCSeconds()}`;
        fileText = fileText.replace(/versionqualifier/g, dStamp);

        fileText = fileText.replace(/solawim_member\/solawim_member\.css/g, `solawim_member/${memberFiles.cssFile}`);
        fileText = fileText.replace(/solawim_member\/solawim_member\.js/g, `solawim_member/${memberFiles.jsFile}`);
        fileText = fileText.replace(/solawim_manage\/solawim_manage\.css/g, `solawim_manage/${manageFiles.cssFile}`);
        fileText = fileText.replace(/solawim_manage\/solawim_manage\.js/g, `solawim_manage/${manageFiles.jsFile}`);
        await fs.promises.writeFile(solawimPhpPath, fileText);

        // copy the assets to the target
        const memberDir = path.resolve(path.join(finalPluginPath, 'solawim_member'));
        console.log('copying assets to ' + memberDir);
        await copyFile(memberFiles.jsFullPath, path.join(memberDir, memberFiles.jsFile));
        await copyFile(memberFiles.cssFullPath, path.join(memberDir, memberFiles.cssFile));

        const manageDir = path.resolve(path.join(finalPluginPath, 'solawim_manage'));
        console.log('copying assets to ' + manageDir);
        console.log('from ', manageFiles.jsFullPath);
        await copyFile(manageFiles.jsFullPath, path.join(manageDir, manageFiles.jsFile));
        await copyFile(manageFiles.cssFullPath, path.join(manageDir, manageFiles.cssFile));
    },
    dependencies: [
        // 'build',
        copyPhpCode,
    ],
} satisfies BuildTask;

const findPageFiles = async (pageQualifier: string) => {
    const assetsDir = path.resolve(viteOutPath, pageQualifier);
    const files = await fs.promises.readdir(assetsDir);
    let jsFile = '';
    let cssFile = '';
    for (const file of files) {
        if (file.endsWith('.js')) {
            jsFile = file;
        }
        if (file.endsWith('.css')) {
            cssFile = file;
        }
    }
    const jsFullPath = path.join(assetsDir, jsFile);
    const cssFullPath = path.join(assetsDir, cssFile);
    return { cssFile, jsFile, jsFullPath, cssFullPath };
};
