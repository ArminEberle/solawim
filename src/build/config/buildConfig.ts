import path from 'path';

export const viteOutPath = path.join(process.cwd(), '.build-tmp/site');
export const finalPluginPath = path.join(process.cwd(), '.build-tmp/plugin');

const isWsl = process.platform === 'linux' && Boolean(process.env.WSL_DISTRO_NAME);

export const localWebServerPath = isWsl
    ? '/mnt/e/private/wordpress/wp-content/plugins/solawim'
    : 'E:\\private\\wordpress\\wp-content\\plugins\\solawim';
