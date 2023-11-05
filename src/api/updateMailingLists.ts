import { apiBaseUrl } from 'src/api/apiBaseUrl';
import { getJsonBody } from 'src/api/getJsonBody';
import type { MemberData } from 'src/members/types/MemberData';


export function updateMailingLists(): Promise<MemberData> {
    return getJsonBody(
        fetch(apiBaseUrl + 'updatemailinglists', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
    );
}