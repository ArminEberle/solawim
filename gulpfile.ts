import { devConfig, prodConfig } from './webpack.config';
import webpack from 'webpack';
import path from 'path';
import fs from 'fs';

const rewritesolawimPhp = (stats: webpack.Stats, outpath: string) => {
    const date = new Date();
    const dStamp = `${date.getUTCFullYear()}${date.getUTCMonth()}${date.getUTCDay()}${date.getUTCHours()}${date.getUTCMinutes()}${date.getUTCSeconds()}`;

    const chunkNameToFilename = new Map<string, string>();
    // for (const [name, entrypoint] of stats?.compilation.entrypoints.entries()) {
    for (const chunk of stats.compilation.chunks) {
        const firstFile = Array.from(chunk.files)[0];
        chunkNameToFilename.set(chunk.name, firstFile);
        console.log('  ' + firstFile);
    }
    const solawimPhp = path.resolve(outpath, '../solawim.php');
    let fileText = fs.readFileSync(solawimPhp)
        .toString();
    fileText = fileText.replace(/versionqualifier/g, dStamp);
    fileText = fileText.replace(/mime\/solawim_libs\.js/g, `mime/${chunkNameToFilename.get('solawim_libs')}`);
    fileText = fileText.replace(/mime\/solawim_manage\.js/g, `mime/${chunkNameToFilename.get('solawim_manage')}`);
    fileText = fileText.replace(/mime\/solawim\.js/g, `mime/${chunkNameToFilename.get('solawim')}`);
    fs.writeFileSync(solawimPhp, fileText);
};

export async function buildDev() {
    return new Promise<void>((resolve, reject) => {
        const compiler = webpack(devConfig);
        compiler.watch({
            aggregateTimeout: 300,
        }, (err, stats) => {
            if (err || stats?.hasErrors()) {
                console.log(err);
                console.log(stats?.compilation.errors);
                return;
            }
            if (!stats?.compilation) {
                reject('No entrypoints received from compilation');
                return;
            }
            console.log('Yet another webpack compile was finished.');

            rewritesolawimPhp(stats, devConfig.output?.path ?? '');
        });
    });
}

export async function buildProd() {
    return new Promise<void>((resolve, reject) => {
        webpack(prodConfig, (err, stats) => {
            if (err || stats?.hasErrors()) {
                console.log(err);
                console.log(stats?.compilation.errors);
                reject(err);
                return;
            }
            if (!stats?.compilation) {
                reject('No entrypoints received from compilation');
                return;
            }
            rewritesolawimPhp(stats, prodConfig.output?.path ?? '');
            resolve();
        });
    });
}