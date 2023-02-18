import fs from 'fs';
import path from 'path';
import { finalPluginPath, viteOutPath } from 'src/build/config/buildConfig';

export default {
    action: () => {
        const memberFiles = findPageFiles('member');
        const manageFiles = findPageFiles('manage');

        const solawimPhpPath = path.resolve(finalPluginPath, 'solawim.php');
        let fileText = fs.readFileSync(solawimPhpPath)
            .toString();
        
            const date = new Date();
        const dStamp = `${date.getUTCFullYear()}${date.getUTCMonth()}${date.getUTCDay()}${date.getUTCHours()}${date.getUTCMinutes()}${date.getUTCSeconds()}`;
        fileText = fileText.replace(/versionqualifier/g, dStamp);


        fileText = fileText.replace(/member\/solawim_member\.css/g, `member/${memberFiles.cssFile}`);
        fileText = fileText.replace(/member\/solawim_member\.js/g, `member/${memberFiles.jsFile}`);
        fileText = fileText.replace(/manage\/solawim_manage\.css/g, `manage/${manageFiles.cssFile}`);
        fileText = fileText.replace(/manage\/solawim_manage\.js/g, `manage/${manageFiles.jsFile}`);
        fs.writeFileSync(solawimPhpPath, fileText);

        // copy the assets to the target
        const memberDir = path.resolve(path.join(finalPluginPath, 'member'));
        console.log('copying assets to ' + memberDir);
        fs.mkdirSync(memberDir, { recursive: true });
        fs.copyFileSync(memberFiles.jsFullPath, path.join(memberDir, memberFiles.jsFile));
        fs.copyFileSync(memberFiles.cssFullPath, path.join(memberDir, memberFiles.cssFile));

        const manageDir = path.resolve(path.join(finalPluginPath, 'manage'));
        console.log('copying assets to ' + manageDir);
        console.log('from ', manageFiles.jsFullPath);
        fs.mkdirSync(manageDir, { recursive: true });
        fs.copyFileSync(manageFiles.jsFullPath, path.join(manageDir, manageFiles.jsFile));
        fs.copyFileSync(manageFiles.cssFullPath, path.join(manageDir, manageFiles.cssFile));
    },
    desc: '',
    dependencies: [
        // 'build',
        'copyPhpCode',
    ],
};

function findPageFiles(pageQualifier: string) {
    const assetsDir = path.resolve(viteOutPath, pageQualifier);
    const files = fs.readdirSync(assetsDir);
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
}
