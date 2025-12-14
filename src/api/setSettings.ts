import { apiBaseUrl } from 'src/api/apiBaseUrl';
import { getJsonBody } from 'src/api/getJsonBody';
import type { Settings } from 'src/types/Settings';

export const setSettings = async (settings: Settings): Promise<Settings> => {
    const response = await fetch(`${apiBaseUrl}settings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
    });

    return getJsonBody(response);
};
