import { apiBaseUrl } from 'src/api/apiBaseUrl';
import { getJsonBody } from 'src/api/getJsonBody';
import type { Settings } from 'src/types/Settings';

export const getSettings = async (): Promise<Settings> => {
    return getJsonBody(fetch(`${apiBaseUrl}settings`));
};
