export type BuildMode = 'prod' | 'dev' | 'watch';

export const ALL_BUILD_SWITCHES = new Set<string>(['--prod', '--dev', '--watch', '--no-deps']);

export const buildSwitches = {
    buildMode: 'prod' as BuildMode,
    isWatch: false,
};
