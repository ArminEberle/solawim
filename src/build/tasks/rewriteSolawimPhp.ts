import fs from 'fs';
import path from 'path';
import { finalPluginPath, viteOutPath } from 'src/build/config/buildConfig';

export default {
    action: () => {
        const assetsDir = path.resolve(viteOutPath, 'assets');
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

        const date = new Date();
        const dStamp = `${date.getUTCFullYear()}${date.getUTCMonth()}${date.getUTCDay()}${date.getUTCHours()}${date.getUTCMinutes()}${date.getUTCSeconds()}`;

        const solawimPhpPath = path.resolve(finalPluginPath, 'solawim.php');
        let fileText = fs.readFileSync(solawimPhpPath)
            .toString();
        fileText = fileText.replace(/versionqualifier/g, dStamp);
        fileText = fileText.replace(/mime\/solawim_member\.css/g, `mime/${cssFile}`);
        fileText = fileText.replace(/mime\/solawim_member\.js/g, `mime/${jsFile}`);
        fs.writeFileSync(solawimPhpPath, fileText);

        // copy the assets to the target
        const mimeDir = path.join(finalPluginPath, 'mime');
        fs.mkdirSync(mimeDir, { recursive: true });
        fs.copyFileSync(jsFullPath, path.join(mimeDir, jsFile));
        fs.copyFileSync(cssFullPath, path.join(mimeDir, cssFile));
    },
    desc: '',
    dependencies: [
        // 'build',
        'copyPhpCode',
    ],
};