import { apiBaseUrl } from 'src/api/apiBaseUrl';
import { getJsonBody } from 'src/api/getJsonBody';
import type { MemberData } from 'src/members/types/MemberData';

export function setMyData(data: MemberData | null): Promise<MemberData> {
    return getJsonBody(
        fetch(apiBaseUrl + 'membership', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: data ? JSON.stringify(data) : '',
        }),
    );
}
