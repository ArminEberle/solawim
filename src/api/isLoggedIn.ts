import { apiBaseUrl } from 'src/api/apiBaseUrl';
import { isDeveloping } from 'src/api/isDeveloping';

export async function isLoggedIn(): Promise<boolean> {
    if (isDeveloping) {
        return new Promise<boolean>(resolve => setTimeout(() => resolve(true), 500));
    }
    const response = await fetch(apiBaseUrl + 'loggedin', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
    if (response.status === 200) {
        return true;
    }
    return false;
}
