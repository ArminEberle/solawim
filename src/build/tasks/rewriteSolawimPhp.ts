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
        const abholraumFiles = await findPageFiles('solawim_abholraumzettel');

        const solawimPhpPath = path.resolve(finalPluginPath, 'solawim.php');
        await fs.promises.writeFile(
            solawimPhpPath,
            await replaceText(solawimPhpPath, memberFiles, manageFiles, abholraumFiles),
        );

        const abholraumPhpPath = path.resolve(finalPluginPath, 'abholraumzettel.php');
        await fs.promises.writeFile(
            abholraumPhpPath,
            await replaceText(abholraumPhpPath, abholraumFiles, manageFiles, abholraumFiles),
        );

        // copy the assets to the target
        const memberDir = path.resolve(path.join(finalPluginPath, 'solawim_member'));
        console.log('copying assets to ' + memberDir);
        await copyFile(memberFiles.jsFullPath, path.join(memberDir, memberFiles.jsFile));
        await copyFile(memberFiles.cssFullPath, path.join(memberDir, memberFiles.cssFile));

        const manageDir = path.resolve(path.join(finalPluginPath, 'solawim_manage'));
        console.log('copying assets to ' + manageDir);
        await copyFile(manageFiles.jsFullPath, path.join(manageDir, manageFiles.jsFile));
        await copyFile(manageFiles.cssFullPath, path.join(manageDir, manageFiles.cssFile));

        const abholraumDir = path.resolve(path.join(finalPluginPath, 'solawim_abholraumzettel'));
        console.log('copying assets to ' + abholraumDir);
        await copyFile(abholraumFiles.jsFullPath, path.join(abholraumDir, abholraumFiles.jsFile));
        await copyFile(abholraumFiles.cssFullPath, path.join(abholraumDir, abholraumFiles.cssFile));
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

async function replaceText(
    solawimPhpPath: string,
    memberFiles: { cssFile: string; jsFile: string; jsFullPath: string; cssFullPath: string },
    manageFiles: { cssFile: string; jsFile: string; jsFullPath: string; cssFullPath: string },
    abholraumFiles: { cssFile: string; jsFile: string; jsFullPath: string; cssFullPath: string },
) {
    let fileText = (await fs.promises.readFile(solawimPhpPath)).toString();

    const date = new Date();
    const dStamp = `${date.getUTCFullYear()}${date.getUTCMonth()}${date.getUTCDay()}${date.getUTCHours()}${date.getUTCMinutes()}${date.getUTCSeconds()}`;
    fileText = fileText.replace(/versionqualifier/g, dStamp);

    fileText = fileText.replace(/solawim_member\/solawim_member\.css/g, `solawim_member/${memberFiles.cssFile}`);
    fileText = fileText.replace(/solawim_member\/solawim_member\.js/g, `solawim_member/${memberFiles.jsFile}`);
    fileText = fileText.replace(/solawim_manage\/solawim_manage\.css/g, `solawim_manage/${manageFiles.cssFile}`);
    fileText = fileText.replace(/solawim_manage\/solawim_manage\.js/g, `solawim_manage/${manageFiles.jsFile}`);
    fileText = fileText.replace(
        /solawim_abholraumzettel\/solawim_abholraumzettel\.css/g,
        `solawim_abholraumzettel/${abholraumFiles.cssFile}`,
    );
    fileText = fileText.replace(
        /solawim_abholraumzettel\/solawim_abholraumzettel\.js/g,
        `solawim_abholraumzettel/${abholraumFiles.jsFile}`,
    );
    return fileText;
}
