import { execSync } from 'child_process';

export default {
    action: () => {
        execSync('rm -rf .build-tmp');
    },
};