import { devConfig, prodConfig } from './webpack.config';
import webpack from 'webpack';
import path from 'path';
import fs from 'fs';

export async function buildDev() {
    return new Promise<void>((resolve, reject) => {
        webpack(devConfig, (err, stats) => {
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

            const chunkNameToFilename = new Map<string, string>();
            // for (const [name, entrypoint] of stats?.compilation.entrypoints.entries()) {
            for (const chunk of stats.compilation.chunks) {
                const firstFile = Array.from(chunk.files)[0];
                chunkNameToFilename.set(chunk.name, firstFile);
            }
            const solawimPhp = path.resolve(devConfig.output?.path ?? '', '../solawim.php');
            let fileText = fs.readFileSync(solawimPhp)
                .toString();
            fileText = fileText.replace(/mime\/solawim_libs\.js/g, `mime/${chunkNameToFilename.get('solawim_libs')}`);
            fileText = fileText.replace(/mime\/solawim_manage\.js/g, `mime/${chunkNameToFilename.get('solawim_manage')}`);
            fileText = fileText.replace(/mime\/solawim\.js/g, `mime/${chunkNameToFilename.get('solawim')}`);
            fs.writeFileSync(solawimPhp, fileText);
            resolve();
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

            const chunkNameToFilename = new Map<string, string>();
            // for (const [name, entrypoint] of stats?.compilation.entrypoints.entries()) {
            for (const chunk of stats.compilation.chunks) {
                const firstFile = Array.from(chunk.files)[0];
                chunkNameToFilename.set(chunk.name, firstFile);
            }
            const solawimPhp = path.resolve(prodConfig.output?.path ?? '', '../solawim.php');
            let fileText = fs.readFileSync(solawimPhp)
                .toString();
            fileText = fileText.replace(/mime\/solawim_libs\.js/g, `mime/${chunkNameToFilename.get('solawim_libs')}`);
            fileText = fileText.replace(/mime\/solawim_manage\.js/g, `mime/${chunkNameToFilename.get('solawim_manage')}`);
            fileText = fileText.replace(/mime\/solawim\.js/g, `mime/${chunkNameToFilename.get('solawim')}`);
            fs.writeFileSync(solawimPhp, fileText);
            resolve();
        });
    });
}