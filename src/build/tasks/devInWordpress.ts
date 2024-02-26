import buildToWordpressWatch from 'src/build/tasks/buildToWordpressWatch';
import copyToWebServerWatch from 'src/build/tasks/copyToWebServerWatch';
import type { BuildTask, } from 'src/build/types/BuildTask';
import { getDefaultTaskProperties, } from 'src/build/utils/getDefaultTaskProperties';

export default {
    ...getDefaultTaskProperties(__filename),
    action: () => {},
    dependencies: [buildToWordpressWatch, copyToWebServerWatch, ],
} satisfies BuildTask;